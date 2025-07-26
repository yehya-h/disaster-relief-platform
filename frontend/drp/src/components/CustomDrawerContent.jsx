import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logoutUser } from '../api/AuthApi';
import { getCurrentLocation } from '../services/location/locationService';
import DeviceInfo from 'react-native-device-info';
import { removeUser, addUser } from '../redux/UserSlice';

const CustomDrawerContent = (props) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const isLoggedIn = user && user.userId && user.role === 0; // role 0 = logged in user

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Get current location and device ID for logout
              const loc = await getCurrentLocation();
              const deviceId = await DeviceInfo.getUniqueId();
              
              const logoutData = {
                deviceId: deviceId,
                liveLocation: {
                  type: "Point",
                  coordinates: [loc.longitude, loc.latitude]
                }
              };

              // Call logout API
              const response = await logoutUser(logoutData);
              
              // Store the new guest token
              if (response && response.token) {
                await AsyncStorage.setItem('token', response.token);
                
                // Update Redux state with guest info
                const jwtDecode = require('jwt-decode');
                const decoded = jwtDecode(response.token);
                dispatch(addUser({
                  userId: decoded.id,
                  role: decoded.role,
                  fcmToken: '',
                  deviceId: deviceId
                }));
              } else {
                // Clear local storage if no token returned
                await AsyncStorage.removeItem('token');
                dispatch(removeUser());
              }
              
              // Set isLoggedIn to false
              if (props.setIsLoggedIn) {
                props.setIsLoggedIn(false);
              }
              
              // Navigate to home (user is now a guest)
              props.navigation.navigate('Home');
              
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {isLoggedIn ? 'Welcome, User!' : 'Guest Mode'}
        </Text>
        <Text style={styles.subHeaderText}>
          {isLoggedIn ? 'You are logged in' : 'You are browsing as a guest'}
        </Text>
      </View>

      <View style={styles.menuContainer}>
        {/* Navigation items */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => props.navigation.navigate('Home')}
        >
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => props.navigation.navigate('Posts')}
        >
          <Text style={styles.menuText}>Posts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => props.navigation.navigate('Profile')}
        >
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>

        {/* Logout button - only show for logged in users */}
        {isLoggedIn && (
          <TouchableOpacity
            style={[styles.menuItem, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Disaster Relief Platform
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#007bff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subHeaderText: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#dc3545',
    borderRadius: 8,
    marginHorizontal: 20,
  },
  logoutText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
});

export default CustomDrawerContent; 
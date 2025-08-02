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
import { removeUser, addUser, updateUserDetails } from '../redux/UserSlice';
import { UserDataHelper } from '../services/UserDataHelper';

const CustomDrawerContent = (props) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  
  // Get user's name
  const getUserDisplayName = () => {
    if (user.fname) {
      return user.fname;
    } 
    return 'User';
  };

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

              const response = await logoutUser(logoutData);
              
              if (response && response.token) {
                // await AsyncStorage.setItem('token', response.token);
                await UserDataHelper.setAuthToken(response.token);
                dispatch(removeUser())
                
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
                // await AsyncStorage.removeItem('token');
                await UserDataHelper.clearUserData();
                dispatch(removeUser());
              }
              
              if (props.setIsLoggedIn) {
                props.setIsLoggedIn(false);
              }
              
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
          {`Welcome, ${getUserDisplayName()}!`}
        </Text>
      </View>

      <View style={styles.menuContainer}>
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

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
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
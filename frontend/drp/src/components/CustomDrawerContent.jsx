import React, { useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../api/AuthApi';
import { getCurrentLocation } from '../services/location/locationService';
import DeviceInfo from 'react-native-device-info';
import { removeUser, addUser } from '../redux/UserSlice';
import { UserDataHelper } from '../services/UserDataHelper';
import { useTheme } from '../hooks/useThem';
import CustomAlert from './CustomAlert';
import ThemeToggle from './ThemeToggle';

const CustomDrawerContent = props => {
  const { colors, isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  // Custom Alert States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState({
    title: '',
    message: '',
    buttons: [],
  });

  // Custom Alert Function
  const showCustomAlert = (title, message, buttons = []) => {
    setAlertData({ title, message, buttons });
    setAlertVisible(true);
  };

  const hideCustomAlert = () => {
    setAlertVisible(false);
  };

  const getUserDisplayName = () => {
    if (user.fname) {
      return user.fname;
    }
    return 'User';
  };

  const handleLogout = async () => {
    try {
      const loc = await getCurrentLocation();
      const deviceId = await DeviceInfo.getUniqueId();

      const logoutData = {
        deviceId: deviceId,
        liveLocation: {
          type: 'Point',
          coordinates: [loc.longitude, loc.latitude],
        },
      };

      const response = await logoutUser(logoutData);

      if (response && response.token) {
        await UserDataHelper.setAuthToken(response.token);
        dispatch(removeUser());

        const jwtDecode = require('jwt-decode');
        const decoded = jwtDecode(response.token);
        dispatch(
          addUser({
            userId: decoded.id,
            role: decoded.role,
            fcmToken: '',
            deviceId: deviceId,
          }),
        );
      } else {
        await UserDataHelper.clearUserData();
        dispatch(removeUser());
      }

      if (props.setIsLoggedIn) {
        props.setIsLoggedIn(false);
      }

    } catch (error) {
      console.error('Logout error:', error);
      // Alert.alert('Error', 'Failed to logout. Please try again.');
      showCustomAlert(
        'Error',
        'Failed to logout. Please try again.'
      )
    };
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.darkerBlueGray,
    },
    header: {
      paddingVertical: 25,
      paddingHorizontal: 20,
      backgroundColor: colors.orange,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 5,
      marginBottom: 20,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
      overflow: 'hidden', // Ensures the logo respects the border radius
    },
    logoImage: {
      width: 100,
      height: 80,
      resizeMode: 'contain',
    },
    avatarText: {
      fontSize: 24,
      color: colors.textColor,
      fontWeight: 'bold',
    },
    userText: {
      marginLeft: 15,
    },
    welcomeText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    userName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.textColor,
    },
    menuContainer: {
      flex: 1,
      paddingTop: 20,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.textColor,
      gap: 15,
    },
    menuText: {
      fontSize: 20,
      color: colors.textColor,
      fontWeight: '500',
    },
    logoutButton: {
      marginTop: 20,
      backgroundColor: colors.red,
      borderRadius: 8,
      marginHorizontal: 20,
      borderBottomWidth: 0,
    },
    logoutText: {
      color: colors.textColor,
      fontWeight: 'bold',
    },
    footer: {
      padding: 20,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.darkestBlueGray,
    },
    footerText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Image
              source={require('../assets/icons/logo.png')}
              style={styles.logoImage}
            />
          </View>
          <View style={styles.userText}>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.userName}>{getUserDisplayName()}!</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => props.navigation.navigate('Home')}
        >
          <MaterialCommunityIcons
            name="home-outline"
            size={22}
            color={colors.textColor}
          />
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => props.navigation.navigate('Notifications')}
        >
          <MaterialCommunityIcons
            name="bell-outline"
            size={22}
            color={colors.textColor}
          />
          <Text style={styles.menuText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => props.navigation.navigate('Profile')}
        >
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={22}
            color={colors.textColor}
          />
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>

        <ThemeToggle />

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutButton]}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons
            name="logout"
            size={22}
            color={colors.textColor}
          />
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Disaster Relief Portal</Text>
      </View>
      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertData.title}
        message={alertData.message}
        buttons={alertData.buttons}
        onClose={hideCustomAlert}
      />
    </View>
  );
};

export default CustomDrawerContent;
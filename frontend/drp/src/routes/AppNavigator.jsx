import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './Authstack.jsx';
import MainDrawer from './MainDrawer.jsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import { useDispatch, useSelector } from 'react-redux';
import { addUser, updateUserDetails } from '../redux/UserSlice';
import { addLiveLoc } from '../redux/LiveLocSlice';
import { guestToken } from '../api/AuthApi';
import { getUserById } from '../api/UserApi';
import DeviceInfo from 'react-native-device-info';
import { getCurrentLocation } from '../services/location/locationService';
import TabNavigator from './TabNavigator';
import { UserDataHelper } from '../services/UserDataHelper';
import { LocationService } from '../services/LocationService';
import { getFcmToken } from '../services/fcmService.js';

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('token: ', token);
        const loc = await getCurrentLocation();
        if (token) {
          const decoded = jwtDecode(token);
          console.log('existing token: ', 'role:', decoded, ' ', token);
          if (decoded.role == 0) {
            try {
              const userDetails = await getUserById();
              dispatch(
                updateUserDetails({
                  fname: userDetails.fname,
                  lname: userDetails.lname,
                  email: userDetails.email,
                  locations: userDetails.locations || [],
                }),
              );
              setIsLoggedIn(true);
            } catch (error) {
              console.log('Error fetching user details:', error);
              if (error.response?.status == 404) {
                console.log("generating token for missing user");
                const token = generateGuestToken(loc);
                if (!token) {
                  Alert.alert(
                    'Token Failure',
                    'Could not generate a token now, try again later.',
                    [
                      { text: 'OK', onPress: () => navigate('Home') }
                    ]
                  );
                }
              }
            }
          }
          dispatch(
            addUser({
              userId: decoded.id,
              role: decoded.role,
              fcmToken: '',
              deviceId: await DeviceInfo.getUniqueId(),
            }),
          );

          dispatch(
            addLiveLoc({
              latitude: loc.latitude,
              longitude: loc.longitude,
            }),
          );
        } else {
          const token = generateGuestToken(loc);
          if (!token) {
            Alert.alert(
              'Token Failure',
              'Could not generate a token now, try again later.',
              [
                { text: 'OK', onPress: () => navigate('Home') }
              ]
            );
          }
          // const response = await guestToken({
          //   deviceId: await DeviceInfo.getUniqueId(),
          //   liveLocation: {
          //     type: 'Point',
          //     coordinates: [loc.longitude, loc.latitude],
          //   },
          // });
          // console.log('new token: ', response.token);
          // if (response.token) {
          //   const decoded = jwtDecode(response.token);
          //   // await AsyncStorage.setItem("token", response.token);
          //   await UserDataHelper.setAuthToken(response.token);
          //   console.log(
          //     'non existing token: ',
          //     'role:',
          //     decoded,
          //     ' ',
          //     response.token,
          //   );
          //   dispatch(
          //     addUser({
          //       userId: decoded.id,
          //       role: decoded.role,
          //       fcmToken: '',
          //       deviceId: await DeviceInfo.getUniqueId(),
          //     }),
          //   );
          //   dispatch(
          //     addLiveLoc({
          //       latitude: loc.latitude,
          //       longitude: loc.longitude,
          //     }),
          //   );
          // }
          await getFcmToken();
        }
      } catch (e) {
        console.log('Error checking token:', e);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  const generateGuestToken = async (loc) => {
    try {
      if (!loc || !loc.latitude || !loc.longitude) {
        console.error('Invalid location provided');
        return null;
      }

      const response = await guestToken({
        deviceId: await DeviceInfo.getUniqueId(),
        liveLocation: {
          type: 'Point',
          coordinates: [loc.longitude, loc.latitude],
        },
      });

      console.log('new token: ', response.token);

      if (!response?.token) {
        console.error('No token received in response');
        return null;
      }

      const decoded = jwtDecode(response.token);
      await UserDataHelper.setAuthToken(response.token);

      console.log('non existing token: ', 'role:', decoded, ' ', response.token);

      dispatch(
        addUser({
          userId: decoded.id,
          role: decoded.role,
          fcmToken: '',
          deviceId: await DeviceInfo.getUniqueId(),
        })
      );

      dispatch(
        addLiveLoc({
          latitude: loc.latitude,
          longitude: loc.longitude,
        })
      );

      return response.token;

    } catch (error) {
      console.error('Error in generateAndProcessGuestToken:', error);
      return null;
    }
  };

  useEffect(() => {
    const initLocationService = async () => {
      const locationService = LocationService.getInstance();

      const started = await locationService.startBackgroundLocationService();
      if (started) {
        console.log('Background location service started');

        // Optional: Get location updates every 15 seconds
        // locationService.getLocationUpdates((location) => {
        //   console.log('Foreground location:', location);
        // });
      } else {
        console.warn('Background location service failed to start');
      }

      return () => {
        locationService.stopBackgroundLocationService();
        // locationService.stopLocationUpdates();
      };
    };

    initLocationService();
  }, []);

  // const userId = useSelector(state => state.user.userId);

  // useEffect(() => {
  //   const setupFcm = async () => {
  //     if (userId) {
  //       const status = await messaging().hasPermission(); // Or check manually
  //       if (status === 1) {
  //         getFcmToken();
  //       }
  //     }
  //   };
  //   setupFcm();
  // }, [userId]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }
  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <MainDrawer setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} />
      ) : (
        <TabNavigator setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} />
      )}
    </NavigationContainer>
  );
}

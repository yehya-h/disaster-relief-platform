import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './Authstack.jsx';
import MainDrawer from './MainDrawer.jsx';
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import { useDispatch, useSelector } from 'react-redux';
import { addUser, updateUserDetails } from '../redux/UserSlice';
import { addLiveLoc } from '../redux/LiveLocSlice';
import { guestToken } from '../api/AuthApi';
import { getUserById } from '../api/UserApi';
import DeviceInfo from 'react-native-device-info';
import { getCurrentLocation } from '../services/location/locationService';
import TabNavigator from './TabNavigator';

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        console.log("token: ", token);
        const loc = await getCurrentLocation();
        if (token) {
          const decoded = jwtDecode(token);
          console.log("existing token: ", "role:", decoded, " ", token);
          if (decoded.role == 0) {
            setIsLoggedIn(true);
            try {
              const userDetails = await getUserById();
              dispatch(updateUserDetails({
                fname: userDetails.fname,
                lname: userDetails.lname,
                email: userDetails.email
              }));
            } catch (error) {
              console.error('Error fetching user details:', error);
            }
          }
          dispatch(addUser({
            userId: decoded.id,
            role: decoded.role,
            fcmToken: '',
            deviceId: await DeviceInfo.getUniqueId()
          }));

          dispatch(addLiveLoc({
            latitude: loc.latitude,
            longitude: loc.longitude
          }));
        }
        else {
          const response = await guestToken({
            deviceId: await DeviceInfo.getUniqueId(),
            liveLocation: {
              type: "Point",
              coordinates: [loc.longitude, loc.latitude]
            }
          });
          console.log("new token: ", response.token);
          if (response.token) {
            const decoded = jwtDecode(response.token);
            await AsyncStorage.setItem("token", response.token);
            console.log("non existing token: ", "role:", decoded, " ", response.token);
            dispatch(addUser({
              userId: decoded.id,
              role: decoded.role,
              fcmToken: '',
              deviceId: await DeviceInfo.getUniqueId()
            }));
            dispatch(addLiveLoc({
              latitude: loc.latitude,
              longitude: loc.longitude
            }));
          }
        }
      } catch (e) {
        console.log("Error checking token:", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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

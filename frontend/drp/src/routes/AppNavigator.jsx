import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './Authstack.jsx';
import MainDrawer from './MainDrawer.jsx';
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../redux/UserSlice';
import { guestToken } from '../api/AuthApi';
import DeviceInfo from 'react-native-device-info';
import { getCurrentLocation } from '../services/location/locationService';

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  console.log("jwtDecode type:", typeof jwtDecode);  // should log 'function'

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        console.log("token: ", token);
        if (token) {
          const decoded = jwtDecode(token);
          console.log("existing token: ", "role:", decoded," ", token);
          if (decoded.role == 0) setIsLoggedIn(true);
          dispatch(addUser({
            userId: decoded.id,
            role: decoded.role,   
            fcmToken: '',
            deviceId: await DeviceInfo.getUniqueId()
          }));
        }
        else {
          const loc = await getCurrentLocation();
          const response = await guestToken({
            deviceId: await DeviceInfo.getUniqueId(),
            liveLocation: {
              type: "Point",
              coordinates: [loc.longitude, loc.latitude]
            }
          });
          console.log("token: ", response.token);
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
      {/* {isLoggedIn ? ( */}
        <MainDrawer setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} />
      {/* ) : (
        <AuthStack setIsLoggedIn={setIsLoggedIn} />
      )} */}
    </NavigationContainer>
  );
}

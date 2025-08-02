/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import AppNavigator from './src/routes/AppNavigator';
import store from './src/redux/store';
import { Provider } from 'react-redux';
import {
  requestNotificationPermission,
  getFcmToken,
} from './src/services/fcmService';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

function App() {
  useEffect(() => {
    async function setupNotifications() {
      const granted = await requestNotificationPermission();
      if (!granted) {
        console.log('Notification permission not granted.');
      }
    }
    setupNotifications();
  }, []);

  useEffect(() => {
    const unsubscribeRefresh = messaging().onTokenRefresh(newToken => {
      console.log('FCM token refreshed:', newToken);
      getFcmToken();
    });
    return unsubscribeRefresh;
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert(
        remoteMessage.notification?.title || '🚨 Notification',
        remoteMessage.notification?.body || 'You have a new alert.',
      );
    });

    return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}

export default App;

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

function App() {
  useEffect(() => {
    async function setupNotifications() {
      const granted = await requestNotificationPermission();
      if (granted) {
        await getFcmToken();
      }
    }
    setupNotifications();
  }, []);
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}

export default App;

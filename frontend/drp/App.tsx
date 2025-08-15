/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { PermissionsAndroid, Platform, Alert, View, StyleSheet } from 'react-native';
import AppNavigator from './src/routes/AppNavigator';
import store from './src/redux/store';
import { Provider } from 'react-redux';
import {
  requestNotificationPermission,
  getFcmToken,
} from './src/services/fcmService';
import messaging from '@react-native-firebase/messaging';

import { useTheme } from './src/hooks/useThem'
function AppContent() {
  const { colors } = useTheme();

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
    <View style={[styles.container, { backgroundColor: colors.blueGray }]}>
      <AppNavigator />
    </View>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

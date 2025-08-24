/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform, Alert, View, StyleSheet } from 'react-native';
import AppNavigator from './src/routes/AppNavigator';
import store from './src/redux/store';
import { Provider } from 'react-redux';
import {
  requestNotificationPermission,
  getFcmToken,
} from './src/services/fcmService';
import messaging from '@react-native-firebase/messaging';
import { I18nManager } from 'react-native';

import { useTheme } from './src/hooks/useThem'
import CustomAlert from './src/components/CustomAlert';
function AppContent() {

  const { colors } = useTheme();
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
  });

  const showCustomAlert = (title: string, message: string) => {
    setAlertConfig({
      visible: true,
      title: title,
      message: message,
    });
  };

  const hideCustomAlert = () => {
    setAlertConfig({
      visible: false,
      title: '',
      message: '',
    });
  };

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
      showCustomAlert(
        remoteMessage.notification?.title || '🚨 Notification',
        remoteMessage.notification?.body || 'You have a new alert.',
      );
    });

    return unsubscribe;
  }, []);

  useEffect(()=>{
    if (I18nManager.isRTL) {
      I18nManager.forceRTL(false);
      I18nManager.allowRTL(false);
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.blueGray }]}>
      <AppNavigator />
      <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={hideCustomAlert}
        />
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

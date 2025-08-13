/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
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
import { View, StyleSheet } from 'react-native';
import Colors from './src/constants/colors';
import CustomAlert from './src/components/CustomAlert';

function App() {
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

  return (
    <Provider store={store}>
      <View style={styles.container}>
        <AppNavigator />
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={hideCustomAlert}
        />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blueGray,
  },
});

export default App;

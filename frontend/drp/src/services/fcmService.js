import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { saveFcmToken } from '../api/fcmApi';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function requestNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}

async function getFcmToken() {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);

    // const storedToken = await AsyncStorage.getItem('fcmToken');
    // if (storedToken === currentToken) {
    //   console.log('Token unchanged, no need to resend.');
    //   return;
    // }

    const deviceId = await DeviceInfo.getUniqueId();
    console.log('Device ID:', deviceId);

    await saveFcmToken({ fcmToken: token, deviceId });

    // await AsyncStorage.setItem('fcmToken', currentToken);
    // console.log('Token saved to AsyncStorage');
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    // return null;
  }
}

export { requestNotificationPermission, getFcmToken };

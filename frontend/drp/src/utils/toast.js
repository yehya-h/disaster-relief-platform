import { ToastAndroid, Platform } from 'react-native';

export const showToast = (message, duration = ToastAndroid.SHORT) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, duration);
  }
  // For iOS, we can add a simple Alert or just ignore for now
};

export const showSuccessToast = (message) => {
  showToast(`✓ ${message}`, ToastAndroid.SHORT);
};

export const showErrorToast = (message) => {
  showToast(`❌ ${message}`, ToastAndroid.LONG);
};
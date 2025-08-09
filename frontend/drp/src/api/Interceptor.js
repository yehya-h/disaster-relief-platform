import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Toast } from 'react-native-toast-message';
import { NODE_API_IP, NODE_API_PORT } from '@env';

const api = axios.create({
    // baseURL: `http://${NODE_API_IP}:${NODE_API_PORT}/api`
    baseURL: `https://disaster-relief-platform-6q95.onrender.com/api`
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response, // Pass through successful responses
    (error) => {
      // List of status codes that should NOT trigger a toast
      const SUPPRESS_TOAST_FOR = [400, 404, 429, 500];
  
      // Only show toast if it's NOT in the suppress list
      if (!SUPPRESS_TOAST_FOR.includes(error.response?.status)) {
        // Toast.show({
        //   type: 'error',
        //   text1: 'Error',
        //   text2: error.response?.data?.message || 'An unexpected error occurred',
        // });
      }
  
      // Always propagate the error to the try/catch block
      return Promise.reject(error);
    }
  );

export default api;
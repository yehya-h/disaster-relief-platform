import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Toast } from 'react-native-toast-message';
import { NODE_API_IP, NODE_API_PORT } from '@env';
import { generateGuestToken } from '../routes/AppNavigator';
import { getCurrentLocation } from '../services/location/locationService';
import { getFcmToken } from '../services/fcmService.js';
import { authContext  } from '../routes/AppNavigator';
import { Alert, BackHandler } from 'react-native';

const api = axios.create({
    baseURL: `http://${NODE_API_IP}:${NODE_API_PORT}/api`
    // baseURL: `https://disaster-relief-platform-6q95.onrender.com/api`
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
    async (error) => {
        if (error.response?.status === 401 && error.response?.data?.message?.includes("Invalid token")) {
            const loc = await getCurrentLocation();
            const newToken = await generateGuestToken(loc);
            if (!newToken) {
                Alert.alert(
                    'Token Failure',
                    'Could not generate a token now, try again later.',
                    [{
                        text: 'OK',
                        onPress: () => BackHandler.exitApp()
                    }]
                );
            }
            if (authContext.setIsLoggedIn) {
                authContext.setIsLoggedIn(false);
            }
            Alert.alert(
                'Session Expired',
                'You must login.',
                [{
                    text: 'OK'
                }]
            );
            await getFcmToken();
        }
        // Always propagate the error to the try/catch block
        return Promise.reject(error);
    }
);

export default api;
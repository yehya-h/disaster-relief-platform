import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Optional: Response interceptor — handle 401, token refresh, etc.
//   api.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//       if (error.response?.status === 401) {
//         console.log("Unauthorized! Maybe token expired.");
//         // You can trigger refresh token logic here
//       }
//       return Promise.reject(error);
//     }
//   );

export default api;
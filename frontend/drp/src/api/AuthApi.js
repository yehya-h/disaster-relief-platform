import api from './Interceptor';
import axios from 'axios';
import { NODE_API_IP, NODE_API_PORT } from '@env';

export const registerUser = async (userData) => {
    console.log("fct: registerUser --- userData: ", userData);
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const loginUser = async (userData) => {
    console.log("fct: loginUser --- userData: ", userData);
    const response = await api.post('/auth/login', userData);
    return response.data;
};

//since no token in header
export const guestToken = async (userData) => {
    console.log("fct: guestToken --- userData: ", userData);
    const response = await axios.post(`http://10.0.2.2:3000/guestToken`,userData);
    return response.data;
};

export const logoutUser = async (userData) => {
    console.log("fct: logoutUser --- userData: ", userData);
    const response = await api.post('/logout', userData);
    return response.data;
};


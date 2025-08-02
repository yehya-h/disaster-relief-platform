import api from './Interceptor';
import axios from 'axios';

export const registerUser = async userData => {
  console.log('fct: registerUser --- userData: ', userData);
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async userData => {
  console.log('fct: loginUser --- userData: ', userData);
  const response = await api.post('/auth/login', userData);
  return response.data;
};

export const resendVerification = async email => {
  console.log('fct: resendVerification --- email: ', email);
  const response = await api.post('/auth/resend-verification', { email });
  return response.data;
};

//since no token in header
export const guestToken = async userData => {
  console.log('fct: guestToken --- userData: ', userData);
  const response = await axios.post(
    `https://disaster-relief-platform-6q95.onrender.com/guestToken`,
    userData,
  );
  // const response = await axios.post(
  //   `http:// 192.168.16.105/guestToken`,
  //   userData,
  // );

  return response.data;
};

export const logoutUser = async userData => {
  console.log('fct: logoutUser --- userData: ', userData);
  const response = await api.post('/logout', userData);
  return response.data;
};

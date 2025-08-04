import api from './Interceptor';


export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    console.log('Notifications fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}
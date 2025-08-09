import api from './Interceptor';

export const getNotifications = async (userId) => {
  try {
    const response = await api.get(`/notifications/${userId}`);
    console.log('Notifications fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

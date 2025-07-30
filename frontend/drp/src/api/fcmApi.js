import api from './Interceptor';

export async function saveFcmToken({ fcmToken, deviceId }) {
  try {
    const response = await api.post('/fcm/save-fcm-token', {
      fcmToken,
      deviceId,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send FCM token:', error);
    throw error;
  }
}

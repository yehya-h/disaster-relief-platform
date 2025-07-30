// import axios from 'axios';
import api from './Interceptor';

export const submitIncidentApi = async (incidentData, imageData) => {
  const formData = new FormData();

  // 1. Incident data (as string)
  formData.append('incident', JSON.stringify(incidentData));

  // 2. Image file
  formData.append('image', {
    uri: imageData.uri,
    type: imageData.type,
    name: imageData.name,
  });

  // 3. Axios POST
  const response = await api.post(`/incidents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
  // src/api/incidentApi.js

  // import axios from 'axios';

  // export const getNearbyIncidents = async (longitude, latitude) => {
  //   try {
  //     const response = await axios.post('http://10.0.2.2:3000/api/incidents/nearby', {
  //       longitude,
  //       latitude,
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error('API Error Details:', {
  //       message: error.message,
  //       url: error.config?.url,
  //       status: error.response?.status,
  //     });
  //     throw error;
  //   }
};

export const getLatestIncidents = async () => {
  try {
    const response = await api.get(`/incidents/latest`);
    return response.data;
  } catch (error) {
    console.error('Error fetching latest incidents:', error);
    throw error;
  }
};

export const getNearbyIncidents = async (latitude, longitude) => {
  try {
    const response = await api.get(`/incidents/nearby`, {
      params: { latitude, longitude },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching nearby incidents:', error);
    throw error;
  }
};
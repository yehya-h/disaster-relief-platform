// src/api/incidentApi.js

import axios from 'axios';

export const getNearbyIncidents = async (longitude, latitude) => {
  try {
    const response = await axios.post('http://10.0.2.2:3000/api/incidents/nearby', {
      longitude,
      latitude,
    });
    return response.data;
  } catch (error) {
    console.error('API Error Details:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
    });
    throw error;
  }
};

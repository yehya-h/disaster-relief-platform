import axios from 'axios';

// Environment variables for API configuration
const NODE_API_IP = import.meta.env.VITE_NODE_API_IP || 'localhost';
const NODE_API_PORT = import.meta.env.VITE_NODE_API_PORT || '3000';
const NODE_ENV = import.meta.env.VITE_NODE_ENV || 'development';

// Create axios instance
const api = axios.create({
  // baseURL: `http://${NODE_API_IP}:${NODE_API_PORT}/api`,
  baseURL: NODE_ENV,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && error.response?.data?.message !== 'Invalid credentials') {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (credentials) => api.post('/auth/admin/login', credentials),
  logout: () => api.post('/auth/admin/logout'),
  verifyToken: () => api.get('/auth/admin/verify'),
};

export const incidentsAPI = {
  getIncidents: (chunk = 1) => api.get(`/incidents/load-more?chunk=${chunk}&all=true`),
  updateIncidentStatus: (id, isFake) => api.patch(`/incidents/${id}`, { isFake }),
  // deleteIncident: (id) => api.delete(`/incidents/${id}`),
};

export const sheltersAPI = {
  getShelters: () => api.get('/shelters'),
  createShelter: (data) => api.post('/shelters', data),
  updateShelter: (id, data) => api.put(`/shelters/${id}`, data),
  deleteShelter: (id) => api.delete(`/shelters/${id}`),
};

export const typesAPI = {
  getTypes: () => api.get('/types'),
  createType: (data) => api.post('/types', data),
  updateType: (id, data) => api.put(`/types/${id}`, data),
  deleteType: (id) => api.delete(`/types/${id}`),
};

export default api;
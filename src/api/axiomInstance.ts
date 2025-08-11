import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // tvoj backend URL
});

// Request interceptor za dodavanje tokena
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor za globalno hendlovanje grešaka
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ovde možeš staviti logout ili refresh token logiku
    }
    return Promise.reject(error);
  }
);

export default api;

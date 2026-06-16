import axios from 'axios';

const api = axios.create({
  baseURL: '', // Using empty string so that Vite proxy maps to http://localhost:5001/api in dev
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Support secure cookies
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors or redirect if needed
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('[AXIOS API ERROR]', error.response || error);
    return Promise.reject(error);
  }
);

export default api;

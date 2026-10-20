
import axios from 'axios';

const axiosReq = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:4001',

  timeout: 15000,
  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosReq.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosReq.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      // Network failure, timeout, or no server response
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosReq;
// src/axios.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // URL base API Laravel Anda
  // baseURL: 'https://api.claristahomestay.web.id/api', // URL base API Laravel Anda
  // baseURL: 'https://tamesha-recompensatory-nonulcerously.ngrok-free.dev/api', // URL ngrok base API Laravel Anda
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Request Interceptor - Add Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle ApiResponseTrait Format
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap response.data to get ApiResponseTrait format
    // Now response will be { success: true, message: "...", data: {...} }
    return response.data;
  },
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Re-throw error for component-level handling
    return Promise.reject(error);
  }
);

export default apiClient;

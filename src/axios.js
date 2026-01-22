// src/axios.js
import axios from 'axios';

const apiClient = axios.create({
  // baseURL: 'http://127.0.0.1:8000/api', // URL base API Laravel Anda
  baseURL: 'https://api.claristahomestay.web.id/api', // URL base API Laravel Anda
  // baseURL: 'https://tamesha-recompensatory-nonulcerously.ngrok-free.dev/api', // URL ngrok base API Laravel Anda
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export default apiClient;
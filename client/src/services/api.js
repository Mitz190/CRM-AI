import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // dev: Vite proxy; prod: same origin
  timeout: 15000,
  withCredentials: true,
});

// Normalize error messages so UI components can show them directly.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    error.userMessage = error.response?.data?.message || 'Network error. Please try again.';
    return Promise.reject(error);
  }
);

export default api;
import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // dev: Vite proxy; prod: same origin
  timeout: 15000,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    error.userMessage = error.response?.data?.message || 'Network error. Please try again.';
    // An expired session on any request except login logs the user out in AuthContext.
    if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/login')) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

export default api;
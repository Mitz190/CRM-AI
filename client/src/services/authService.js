import api from './api';

const user = (res) => res.data.data.user;

export const authApi = {
  register: (data) => api.post('/auth/register', data).then(user),
  login: (data) => api.post('/auth/login', data).then(user),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me').then(user),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data.message),
  resetPassword: (token, password) => api.patch(`/auth/reset-password/${token}`, { password }).then(user),
  updateProfile: (data) => api.patch('/auth/me', data).then(user),
  changePassword: (data) => api.patch('/auth/change-password', data).then(user),
};
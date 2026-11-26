import api from './api';

export const userApi = {
  list: (params) => api.get('/users', { params }).then((r) => r.data.data),
  create: (data) => api.post('/users', data).then((r) => r.data.data.user),
  update: (id, data) => api.patch(`/users/${id}`, data).then((r) => r.data.data.user),
};
import api from './api';

const data = (res) => res.data.data;

// Blob responses hide the JSON error body, so unwrap it for a readable message.
const readBlobError = async (err) => {
  if (err.response?.data instanceof Blob) {
    try {
      const json = JSON.parse(await err.response.data.text());
      err.userMessage = json.message || err.userMessage;
    } catch { /* keep the generic message */ }
  }
  throw err;
};

export const customerApi = {
  list: (params) => api.get('/customers', { params }).then(data),
  get: (id) => api.get(`/customers/${id}`).then(data),
  create: (body) => api.post('/customers', body).then((r) => r.data.data.customer),
  update: (id, body) => api.patch(`/customers/${id}`, body).then((r) => r.data.data.customer),
  remove: (id) => api.delete(`/customers/${id}`),
  exportCsv: () => api.get('/customers/export', { responseType: 'blob' }).then((r) => r.data).catch(readBlobError),
  importCsv: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/customers/import', form).then(data); // browser sets the multipart boundary
  },
};
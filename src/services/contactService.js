import { getToken } from './authService';
import createApiClient from './httpClient';

const API_BASE = '/api/contacts/';

const api = createApiClient();

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const contactService = {
  getContacts: async (type, extraParams = {}) => {
    const params = { ...extraParams };
    if (type && type !== 'all') params.type = type;
    const res = await api.get(API_BASE, { ...getHeaders(), params });
    return res.data;
  },

  getContact: async (id) => {
    const res = await api.get(`${API_BASE}/${id}/`, getHeaders());
    return res.data;
  },

  createContact: async (data) => {
    const res = await api.post(API_BASE, data, getHeaders());
    return res.data;
  },

  updateContact: async (id, data) => {
    const res = await api.put(`${API_BASE}/${id}/`, data, getHeaders());
    return res.data;
  },

  deleteContact: async (id) => {
    const res = await api.delete(`${API_BASE}/${id}/`, getHeaders());
    return res.data;
  },

  syncToBusinessCentral: async (id) => {
    const res = await api.post(`${API_BASE}${id}/sync_bc/`, {}, getHeaders());
    return res.data;
  },

  bulkDelete: async (ids) => {
    const res = await api.post(`${API_BASE}/bulk-delete/`, { ids }, getHeaders());
    return res.data;
  },
};

export default contactService;

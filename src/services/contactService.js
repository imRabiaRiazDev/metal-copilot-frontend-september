import axios from 'axios';
import { getToken } from './authService';

const API_BASE = '/api/contacts';

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const contactService = {
  getContacts: async (type) => {
    const params = type && type !== 'all' ? { type } : {};
    const res = await axios.get(API_BASE, { ...getHeaders(), params });
    return res.data;
  },

  getContact: async (id) => {
    const res = await axios.get(`${API_BASE}/${id}/`, getHeaders());
    return res.data;
  },

  createContact: async (data) => {
    const res = await axios.post(API_BASE, data, getHeaders());
    return res.data;
  },

  updateContact: async (id, data) => {
    const res = await axios.put(`${API_BASE}/${id}/`, data, getHeaders());
    return res.data;
  },

  deleteContact: async (id) => {
    const res = await axios.delete(`${API_BASE}/${id}/`, getHeaders());
    return res.data;
  },

  bulkDelete: async (ids) => {
    const res = await axios.post(`${API_BASE}/bulk-delete/`, { ids }, getHeaders());
    return res.data;
  },
};

export default contactService;

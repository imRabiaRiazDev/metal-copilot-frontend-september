import axios from 'axios';
import { getToken } from './authService';

const API_BASE = '/api/deals';

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const dealService = {
  getDeals: async (params = {}) => {
    const res = await axios.get(API_BASE, { ...getHeaders(), params });
    return res.data;
  },

  getDeal: async (id) => {
    const res = await axios.get(`${API_BASE}/${id}/`, getHeaders());
    return res.data;
  },

  createDeal: async (data) => {
    const res = await axios.post(API_BASE, data, getHeaders());
    return res.data;
  },

  updateDeal: async (id, data) => {
    const res = await axios.put(`${API_BASE}/${id}/`, data, getHeaders());
    return res.data;
  },

  deleteDeal: async (id) => {
    const res = await axios.delete(`${API_BASE}/${id}/`, getHeaders());
    return res.data;
  },
};

export default dealService;

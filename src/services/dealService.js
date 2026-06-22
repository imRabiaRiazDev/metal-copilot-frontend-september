import { getToken } from './authService';
import createApiClient from './httpClient';

const API_BASE = '/api/rfq/deals';

const api = createApiClient();

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const dealService = {
  getDeals: async (params = {}) => {
    const res = await api.get(API_BASE, { ...getHeaders(), params });
    return res.data;
  },

  getDeal: async (id) => {
    const res = await api.get(`${API_BASE}/${id}/`, getHeaders());
    return res.data;
  },

  createDeal: async (data) => {
    const res = await api.post(API_BASE, data, getHeaders());
    return res.data;
  },

  updateDeal: async (id, data) => {
    const res = await api.put(`${API_BASE}/${id}/`, data, getHeaders());
    return res.data;
  },

  deleteDeal: async (id) => {
    const res = await api.delete(`${API_BASE}/${id}/`, getHeaders());
    return res.data;
  },
};

export default dealService;

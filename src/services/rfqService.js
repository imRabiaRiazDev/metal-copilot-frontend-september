import axios from 'axios';
import { getToken } from './authService';

const API_BASE_URL = '/api/rfq';

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const rfqService = {
  getRFQs: async (params = {}) => {
    const res = await axios.get(`${API_BASE_URL}/rfqs/`, { ...getHeaders(), params });
    return res.data;
  },

  getRFQById: async (id) => {
    const res = await axios.get(`${API_BASE_URL}/rfqs/${id}/`, getHeaders());
    return res.data;
  },

  createRFQ: async (rfqData) => {
    const res = await axios.post(`${API_BASE_URL}/rfqs/`, rfqData, getHeaders());
    return res.data;
  },

  updateRFQ: async (id, rfqData) => {
    const res = await axios.put(`${API_BASE_URL}/rfqs/${id}/`, rfqData, getHeaders());
    return res.data;
  },

  deleteRFQ: async (id) => {
    const res = await axios.delete(`${API_BASE_URL}/rfqs/${id}/`, getHeaders());
    return res.data;
  },

  reviewRFQ: async (id, reviewData) => {
    const res = await axios.post(`${API_BASE_URL}/rfqs/${id}/review/`, reviewData, getHeaders());
    return res.data;
  },

  getAnalytics: async () => {
    const res = await axios.get(`${API_BASE_URL}/rfqs/analytics/`, getHeaders());
    return res.data;
  },

  getDashboardStats: async () => {
    const res = await axios.get(`${API_BASE_URL}/rfqs/dashboard_stats/`, getHeaders());
    return res.data;
  },

  getRFQItems: async (rfqId) => {
    const res = await axios.get(`${API_BASE_URL}/items/?rfq_id=${rfqId}`, getHeaders());
    return res.data;
  },

  getRFQAttachments: async (rfqId) => {
    const res = await axios.get(`${API_BASE_URL}/attachments/?rfq_id=${rfqId}`, getHeaders());
    return res.data;
  },
};

export default rfqService;

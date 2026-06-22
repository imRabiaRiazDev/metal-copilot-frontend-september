import { getToken } from './authService';
import createApiClient from './httpClient';

const API_BASE = '/api/rfq';

const api = createApiClient();

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const emailService = {
  triggerEmailMonitoring: async () => {
    const res = await api.post(`${API_BASE}/monitor/emails/`, {}, getHeaders());
    return res.data;
  },

  triggerAIProcessing: async (orderId) => {
    const res = await api.post(`${API_BASE}/monitor/ai/${orderId}/`, {}, getHeaders());
    return res.data;
  },

  triggerBusinessCentralSync: async (orderId) => {
    const res = await api.post(`${API_BASE}/monitor/bc/${orderId}/`, {}, getHeaders());
    return res.data;
  },

  getTaskStatus: async (taskId) => {
    const res = await api.get(`${API_BASE}/monitor/task/${taskId}/`, getHeaders());
    return res.data;
  },

  syncProductsFromBC: async () => {
    const res = await api.post(`${API_BASE}/monitor/sync-products/`, {}, getHeaders());
    return res.data;
  },

  getMicrosoftEmails: async () => {
    const res = await api.get(`${API_BASE}/monitor/emails/list/`, getHeaders());
    return res.data;
  },

  getRFQEmails: async () => {
    const res = await api.get(`${API_BASE}/monitor/emails/orders/`, getHeaders());
    return res.data;
  },
};

export default emailService;

import { getToken } from './authService';
import createApiClient from './httpClient';

const API_BASE = 'https://corimetal.scarerror.com/api/rfq/deals';
const API_THREADS = 'https://corimetal.scarerror.com/api/rfq/email-threads';
const API_PULL = 'https://corimetal.scarerror.com/api/rfq/monitor/emails/pull/';
const API_TASK = 'https://corimetal.scarerror.com/api/rfq/monitor/task';
const API_ATTACHMENTS = 'https://corimetal.scarerror.com/api/rfq/deals';

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
    const files = data.attachments || [];
    const dealData = { ...data };
    delete dealData.attachments;

    const res = await api.post(API_BASE, dealData, getHeaders());
    const deal = res.data;

    if (files.length > 0) {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      await api.post(`${API_ATTACHMENTS}/${deal.id}/attachments/`, formData, {
        ...getHeaders(),
        headers: {
          ...getHeaders().headers,
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    return deal;
  },

  updateDeal: async (id, data) => {
    const res = await api.put(`${API_BASE}/${id}/`, data, getHeaders());
    return res.data;
  },

  deleteDeal: async (id) => {
    const res = await api.delete(`${API_BASE}/${id}/`, getHeaders());
    return res.data;
  },

  pullEmails: async (start_time, end_time) => {
    const res = await api.post(API_PULL, { start_time, end_time }, getHeaders());
    return res.data;
  },

  getTaskStatus: async (taskId) => {
    const res = await api.get(`${API_TASK}/${taskId}/`, getHeaders());
    return res.data;
  },

  getEmailThreads: async (params = {}) => {
    const res = await api.get(API_THREADS, { ...getHeaders(), params });
    return res.data;
  },

  categorizeThread: async (threadId) => {
    const res = await api.post(`${API_THREADS}/${threadId}/categorize/`, {}, getHeaders());
    return res.data;
  },

  updateThread: async (threadId, data) => {
    const res = await api.patch(`${API_THREADS}/${threadId}/`, data, getHeaders());
    return res.data;
  },
};

export default dealService;

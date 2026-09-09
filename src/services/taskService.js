import { getToken } from './authService';
import createApiClient from './httpClient';

const API_BASE = 'https://corimetal.scarerror.com/api/tasks/';

const api = createApiClient();

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const taskService = {
  getTasks: async (params = {}) => {
    const res = await api.get(API_BASE, { ...getHeaders(), params });
    return res.data;
  },

  getTask: async (id) => {
    const res = await api.get(`${API_BASE}/${id}/`, getHeaders());
    return res.data;
  },

  createTask: async (data) => {
    const res = await api.post(API_BASE, data, getHeaders());
    return res.data;
  },

  updateTask: async (id, data) => {
    const res = await api.put(`${API_BASE}/${id}/`, data, getHeaders());
    return res.data;
  },

  deleteTask: async (id) => {
    const res = await api.delete(`${API_BASE}/${id}/`, getHeaders());
    return res.data;
  },

  completeTask: async (id) => {
    const res = await api.post(`${API_BASE}/${id}/complete/`, {}, getHeaders());
    return res.data;
  },
};

export default taskService;

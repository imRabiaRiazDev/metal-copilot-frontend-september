import axios from 'axios';
import { getToken } from './authService';

const API_BASE = '/api/tasks';

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const taskService = {
  getTasks: async (params = {}) => {
    const res = await axios.get(API_BASE, { ...getHeaders(), params });
    return res.data;
  },

  getTask: async (id) => {
    const res = await axios.get(`${API_BASE}/${id}/`, getHeaders());
    return res.data;
  },

  createTask: async (data) => {
    const res = await axios.post(API_BASE, data, getHeaders());
    return res.data;
  },

  updateTask: async (id, data) => {
    const res = await axios.put(`${API_BASE}/${id}/`, data, getHeaders());
    return res.data;
  },

  deleteTask: async (id) => {
    const res = await axios.delete(`${API_BASE}/${id}/`, getHeaders());
    return res.data;
  },

  completeTask: async (id) => {
    const res = await axios.post(`${API_BASE}/${id}/complete/`, {}, getHeaders());
    return res.data;
  },
};

export default taskService;

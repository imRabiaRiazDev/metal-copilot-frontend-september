import axios from 'axios';
import { getToken } from './authService';

const API_BASE = '/api/activity';

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const activityService = {
  getActivity: async (entityType, entityId) => {
    const res = await axios.get(`${API_BASE}/`, {
      ...getHeaders(),
      params: { entity_type: entityType, entity_id: entityId },
    });
    return res.data;
  },

  addNote: async (entityType, entityId, text) => {
    const res = await axios.post(
      `${API_BASE}/notes/`,
      { entity_type: entityType, entity_id: entityId, text },
      getHeaders()
    );
    return res.data;
  },
};

export default activityService;

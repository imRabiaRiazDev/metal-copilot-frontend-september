/**
 * Email Monitoring Service
 * Handles all API calls related to email monitoring and Microsoft Graph integration
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/rfq';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Trigger email monitoring for RFQ detection
 * @returns {Promise} - Response with task ID
 */
export const triggerEmailMonitoring = async () => {
  try {
    const response = await api.post('/monitor/emails/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Email monitoring failed' };
  }
};

/**
 * Trigger AI processing for a specific RFQ
 * @param {number} rfqId - RFQ ID
 * @returns {Promise} - Response with task ID
 */
export const triggerAIProcessing = async (rfqId) => {
  try {
    const response = await api.post(`/monitor/ai/${rfqId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'AI processing failed' };
  }
};

/**
 * Trigger Business Central sync for a specific RFQ
 * @param {number} rfqId - RFQ ID
 * @returns {Promise} - Response with task ID
 */
export const triggerBusinessCentralSync = async (rfqId) => {
  try {
    const response = await api.post(`/monitor/bc/${rfqId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Business Central sync failed' };
  }
};

/**
 * Get task status
 * @param {string} taskId - Celery task ID
 * @returns {Promise} - Response with task status
 */
export const getTaskStatus = async (taskId) => {
  try {
    const response = await api.get(`/monitor/task/${taskId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to get task status' };
  }
};

/**
 * Sync products from Business Central
 * @returns {Promise} - Response with sync count
 */
export const syncProductsFromBC = async () => {
  try {
    const response = await api.post('/monitor/sync-products/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Product sync failed' };
  }
};

/**
 * Get recent Microsoft emails
 * @returns {Promise} - Response with emails list
 */
export const getMicrosoftEmails = async () => {
  try {
    const response = await api.get('/monitor/emails/list/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to get emails' };
  }
};

/**
 * Get RFQ-related emails
 * @returns {Promise} - Response with RFQ emails
 */
export const getRFQEmails = async () => {
  try {
    const response = await api.get('/monitor/emails/rfq/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to get RFQ emails' };
  }
};

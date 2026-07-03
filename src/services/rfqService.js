import { getToken } from './authService';
import createApiClient from './httpClient';

const API_BASE_URL = '/api/rfq';

const api = createApiClient();

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const rfqService = {
  getRFQs: async (params = {}) => {
    const res = await api.get(`${API_BASE_URL}/orders/`, { ...getHeaders(), params });
    return res.data;
  },

  getRFQById: async (id) => {
    const res = await api.get(`${API_BASE_URL}/orders/${id}/`, getHeaders());
    return res.data;
  },

  createRFQ: async (data) => {
    const res = await api.post(`${API_BASE_URL}/orders/`, data, getHeaders());
    return res.data;
  },

  updateRFQ: async (id, data) => {
    const res = await api.put(`${API_BASE_URL}/orders/${id}/`, data, getHeaders());
    return res.data;
  },

  deleteRFQ: async (id) => {
    const res = await api.delete(`${API_BASE_URL}/orders/${id}/`, getHeaders());
    return res.data;
  },

  reviewRFQ: async (id, reviewData) => {
    const res = await api.post(`${API_BASE_URL}/orders/${id}/review/`, reviewData, getHeaders());
    return res.data;
  },

  getAnalytics: async () => {
    const res = await api.get(`${API_BASE_URL}/orders/analytics/`, getHeaders());
    return res.data;
  },

  getDashboardStats: async () => {
    const res = await api.get(`${API_BASE_URL}/orders/dashboard_stats/`, getHeaders());
    return res.data;
  },

  getRFQItems: async (orderId) => {
    const res = await api.get(`${API_BASE_URL}/items/?order_id=${orderId}`, getHeaders());
    return res.data;
  },

  createRFQItem: async (data) => {
    const res = await api.post(`${API_BASE_URL}/items/`, data, getHeaders());
    return res.data;
  },

  updateRFQItem: async (id, data) => {
    const res = await api.put(`${API_BASE_URL}/items/${id}/`, data, getHeaders());
    return res.data;
  },

  deleteRFQItem: async (id) => {
    const res = await api.delete(`${API_BASE_URL}/items/${id}/`, getHeaders());
    return res.data;
  },

  getRFQAttachments: async (orderId) => {
    const res = await api.get(`${API_BASE_URL}/attachments/?order_id=${orderId}`, getHeaders());
    return res.data;
  },

  getAvailableSuppliers: async () => {
    const res = await api.get(`${API_BASE_URL}/orders/available_suppliers/`, getHeaders());
    return res.data;
  },

  assignSupplier: async (orderId, supplierId, autoDispatch = false) => {
    const res = await api.post(`${API_BASE_URL}/orders/${orderId}/assign_supplier/`, {
      supplier_id: supplierId,
      auto_dispatch: autoDispatch,
    }, getHeaders());
    return res.data;
  },

  dispatchToSupplier: async (orderId, supplierId) => {
    const res = await api.post(`${API_BASE_URL}/orders/${orderId}/dispatch_to_supplier/`, {
      supplier_id: supplierId,
    }, getHeaders());
    return res.data;
  },

  getOrderSuppliers: async (orderId) => {
    const res = await api.get(`${API_BASE_URL}/orders/${orderId}/suppliers/`, getHeaders());
    return res.data;
  },

  syncToBusinessCentral: async (orderId) => {
    const res = await api.post(`${API_BASE_URL}/monitor/bc/${orderId}/`, {}, getHeaders());
    return res.data;
  },

  bulkDeleteRFQs: async (ids) => {
    const res = await api.post(`${API_BASE_URL}/orders/bulk_delete/`, { ids }, getHeaders());
    return res.data;
  },
};

export default rfqService;

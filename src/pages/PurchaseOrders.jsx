import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import rfqService from '../services/rfqService';
import { Search, Eye, RefreshCw, Loader2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';

const statusPills = {
  pending: 'bg-amber/10 text-amber border-amber/20',
  processing: 'bg-gold/10 text-gold border-gold/20',
  completed: 'bg-emerald/10 text-emerald border-emerald/20',
  rejected: 'bg-danger/10 text-danger border-danger/20',
  fulfilled: 'bg-emerald/10 text-emerald border-emerald/20',
  cancelled: 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-white/60 border-slate-300 dark:border-white/20',
};

const priorityPills = {
  low: 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/60 border-slate-300 dark:border-white/20',
  medium: 'bg-gold/10 text-gold border-gold/20',
  high: 'bg-amber/10 text-amber border-amber/20',
  urgent: 'bg-danger/10 text-danger border-danger/20',
};

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [filters, page, pageSize]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      params.page = page;
      params.page_size = pageSize;

      const response = await rfqService.getPurchaseOrders(params);
      setOrders(response.results || response);
      setTotal(response.count || response.length);
      setError(null);
    } catch (err) {
      setError('Failed to fetch purchase orders');
      toast.error('Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (order) => {
    navigate(`/rfqs/${order.rfq_number}`);
  };

  const handleDelete = async (order) => {
    try {
      await rfqService.deleteRFQ(order.id);
      toast.success('Purchase order deleted');
      setDeleteConfirm(null);
      fetchPurchaseOrders();
    } catch {
      toast.error('Failed to delete purchase order');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;
    setBulkDeleting(true);
    try {
      await rfqService.bulkDeleteRFQs(selectedOrders);
      toast.success(`${selectedOrders.length} purchase order(s) deleted`);
      setSelectedOrders([]);
      setBulkDeleteConfirm(false);
      fetchPurchaseOrders();
    } catch {
      toast.error('Failed to delete purchase orders');
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Purchase Orders</h1>
        <p className="text-slate-600 dark:text-white/60">Customer purchase orders</p>
      </div>

      <div className="bg-white dark:bg-navy border border-border-light dark:border-white/10 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" size={18} />
              <input
                type="text"
                placeholder="Search orders..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 rounded-lg pl-10 pr-4 py-2 text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 rounded-lg px-4 py-2 text-slate-700 dark:text-white focus:outline-none focus:border-gold transition-colors"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 rounded-lg px-4 py-2 text-slate-700 dark:text-white focus:outline-none focus:border-gold transition-colors"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <button
            onClick={fetchPurchaseOrders}
            className="flex items-center gap-2 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 rounded-lg px-4 py-2 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          {selectedOrders.length > 0 && (
            <button
              onClick={() => setBulkDeleteConfirm(true)}
              className="flex items-center gap-2 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 rounded-lg px-4 py-2 transition-colors"
            >
              <Trash2 size={18} />
              Delete ({selectedOrders.length})
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-gold" size={32} />
        </div>
      ) : error ? (
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-navy border border-border-light dark:border-white/10 rounded-xl p-12 text-center">
          <p className="text-slate-600 dark:text-white/60">No purchase orders found</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-navy border border-border-light dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light dark:border-white/10">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(orders.map(o => o.id));
                        } else {
                          setSelectedOrders([]);
                        }
                      }}
                      className="w-4 h-4 rounded border-border-light dark:border-white/20 text-gold focus:ring-gold"
                    />
                  </th>
                  <th className="text-left p-4 text-slate-600 dark:text-white/60 font-medium">RFQ Number</th>
                  <th className="text-left p-4 text-slate-600 dark:text-white/60 font-medium">Company</th>
                  <th className="text-left p-4 text-slate-600 dark:text-white/60 font-medium">PO Number</th>
                  <th className="text-left p-4 text-slate-600 dark:text-white/60 font-medium">Status</th>
                  <th className="text-left p-4 text-slate-600 dark:text-white/60 font-medium">Priority</th>
                  <th className="text-left p-4 text-slate-600 dark:text-white/60 font-medium">Stage</th>
                  <th className="text-left p-4 text-slate-600 dark:text-white/60 font-medium">Date</th>
                  <th className="text-left p-4 text-slate-600 dark:text-white/60 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border-light dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders([...selectedOrders, order.id]);
                          } else {
                            setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-border-light dark:border-white/20 text-gold focus:ring-gold"
                      />
                    </td>
                    <td className="p-4">
                      <span className="text-gold font-medium">{order.rfq_number}</span>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-white">{order.company_name || '-'}</td>
                    <td className="p-4 text-slate-700 dark:text-white">{order.po_number || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusPills[order.status] || statusPills.pending}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityPills[order.priority] || priorityPills.medium}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-white capitalize">{order.stage}</td>
                    <td className="p-4 text-slate-600 dark:text-white/60">
                      {order.email_received_at ? new Date(order.email_received_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(order)}
                          className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(order)}
                          className="flex items-center gap-2 text-danger hover:text-danger/80 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy rounded-xl shadow-card border border-border-light dark:border-white/10 p-6 max-w-md w-full mx-4 animate-fadeInUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
                <Trash2 size={20} className="text-danger" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-white">Delete Purchase Order</h3>
            </div>

            <p className="text-sm text-slate-600 dark:text-white/80 mb-6">
              Are you sure you want to delete purchase order {deleteConfirm.rfq_number}? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-border-light dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-lg bg-danger text-white hover:bg-danger/90 transition-all duration-200 text-sm font-medium flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy rounded-xl shadow-card border border-border-light dark:border-white/10 p-6 max-w-md w-full mx-4 animate-fadeInUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
                <Trash2 size={20} className="text-danger" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-white">Delete Purchase Orders</h3>
            </div>

            <p className="text-sm text-slate-600 dark:text-white/80 mb-6">
              Are you sure you want to delete {selectedOrders.length} purchase order(s)? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBulkDeleteConfirm(false)}
                disabled={bulkDeleting}
                className="px-4 py-2 rounded-lg border border-border-light dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-200 text-sm font-medium disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="px-4 py-2 rounded-lg bg-danger text-white hover:bg-danger/90 transition-all duration-200 text-sm font-medium disabled:opacity-60 flex items-center gap-2"
              >
                {bulkDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;

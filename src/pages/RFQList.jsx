import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import rfqService from '../services/rfqService';
import contactService from '../services/contactService';
import { Search, Eye, Edit3, Trash2, Save, X, Loader2, FileSearch, Mail, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

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

const RFQList = () => {
  const queryClient = useQueryClient();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [quickView, setQuickView] = useState(null);
  const [quickViewDetail, setQuickViewDetail] = useState(null);
  const [quickViewLoading, setQuickViewLoading] = useState(false);

  useEffect(() => {
    fetchRFQs();
  }, [filters]);

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      const data = await rfqService.getRFQs(params);
      setRfqs(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch RFQ data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const [editRFQ, setEditRFQ] = useState(null);
  const [editDetail, setEditDetail] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editItems, setEditItems] = useState([]);
  const [deletedItemIds, setDeletedItemIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [dispatching, setDispatching] = useState(false);
  const [syncingId, setSyncingId] = useState(null);

  const handleEditRFQ = async (rfq) => {
    setEditRFQ(rfq);
    setEditLoading(true);
    setEditDetail(null);
    setEditItems([]);
    setDeletedItemIds([]);
    setSelectedSupplier(null);
    try {
      const detail = await rfqService.getRFQById(rfq.id);
      setEditDetail(detail);
      setEditItems(detail.items || []);
      
      // Fetch available suppliers
      const suppliersData = await rfqService.getAvailableSuppliers();
      setSuppliers(suppliersData.suppliers || []);
      
      // Set current supplier if already assigned
      if (detail.supplier_id) {
        setSelectedSupplier(detail.supplier_id);
      }
    } catch {
      toast.error('Failed to load RFQ details');
      setEditRFQ(null);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditDetail(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setEditItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddItem = () => {
    setEditItems(prev => [...prev, {
      item_name: '',
      item_code: '',
      description: '',
      quantity: 1,
      unit: '',
      unit_price: null,
      total_price: null,
    }]);
  };

  const handleRemoveItem = (index) => {
    const item = editItems[index];
    if (item.id) {
      setDeletedItemIds(prev => [...prev, item.id]);
    }
    setEditItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditSave = async () => {
    if (!editRFQ || !editDetail) return;
    setSaving(true);
    try {
      const payload = { ...editDetail };
      delete payload.id;
      delete payload.items;
      delete payload.attachments;
      delete payload.created_at;
      delete payload.updated_at;
      await rfqService.updateRFQ(editRFQ.id, payload);

      for (const id of deletedItemIds) {
        await rfqService.deleteRFQItem(id);
      }

      for (const item of editItems) {
        const itemPayload = {
          order: editRFQ.id,
          item_name: item.item_name || '',
          item_code: item.item_code || '',
          description: item.description || '',
          quantity: item.quantity || 0,
          unit: item.unit || '',
          unit_price: item.unit_price || null,
          total_price: item.total_price || null,
        };
        if (item.id) {
          await rfqService.updateRFQItem(item.id, itemPayload);
        } else {
          await rfqService.createRFQItem(itemPayload);
        }
      }

      toast.success('RFQ updated');
      setEditRFQ(null);
      setEditDetail(null);
      setEditItems([]);
      setDeletedItemIds([]);
      fetchRFQs();
    } catch {
      toast.error('Failed to update RFQ');
    } finally {
      setSaving(false);
    }
  };

  const handleEditDelete = async () => {
    if (!editRFQ) return;
    try {
      await rfqService.deleteRFQ(editRFQ.id);
      toast.success('RFQ deleted');
      setEditRFQ(null);
      setEditDetail(null);
      setDeleteConfirm(null);
      fetchRFQs();
    } catch {
      toast.error('Failed to delete RFQ');
    }
  };

  const handleAssignSupplier = async () => {
    if (!editRFQ || !selectedSupplier) return;
    try {
      await rfqService.assignSupplier(editRFQ.id, selectedSupplier);
      toast.success('Supplier assigned successfully');
      // Refresh the RFQ detail to get updated supplier info
      const detail = await rfqService.getRFQById(editRFQ.id);
      setEditDetail(detail);
      // Refresh tasks to move completed tasks to Completed column
      queryClient.invalidateQueries(['tasks']);
    } catch {
      toast.error('Failed to assign supplier');
    }
  };

  const handleDispatchToSupplier = async () => {
    if (!editRFQ || !selectedSupplier) {
      toast.error('Please select a supplier first');
      return;
    }
    setDispatching(true);
    try {
      await rfqService.dispatchToSupplier(editRFQ.id, selectedSupplier);
      toast.success('RFQ dispatched to supplier');
      // Refresh the RFQ detail
      const detail = await rfqService.getRFQById(editRFQ.id);
      setEditDetail(detail);
    } catch {
      toast.error('Failed to dispatch RFQ to supplier');
    } finally {
      setDispatching(false);
    }
  };

  const handleSyncToBusinessCentral = async (rfq, e) => {
    e.stopPropagation();
    setSyncingId(rfq.id);
    try {
      const response = await rfqService.syncToBusinessCentral(rfq.id);
      toast.success(response.message || 'Business Central sync started');
      await fetchRFQs();
    } catch {
      toast.error('Failed to start Business Central sync');
    } finally {
      setSyncingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] gap-3">
        <Loader2 size={32} className="animate-spin text-gold" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/60">Loading documents...</span>
      </div>
    );
  }

  return (
    <div className="min-h-0 w-full max-w-full overflow-x-hidden">
      <div className="glow glow-gold left-1/4 top-1/3" />

      <div className="mb-8 relative z-10">
        <h1 className="text-3xl font-bold text-slate-700 dark:text-white mb-1">
          RFQ <span className="text-gold">Management</span>
        </h1>
        <p className="text-sm text-slate-400 dark:text-white/60">
          Review, analyze, and manage quotation requests.
        </p>
      </div>

      <div className="border border-border-light dark:border-white/10 rounded-xl p-5 mb-6 bg-white dark:bg-navy shadow-card relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60 font-mono">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold transition-all duration-200"
            >
              <option value="">All States</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60 font-mono">Priority</label>
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold transition-all duration-200"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60 font-mono">Search</label>
            <div className="relative">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Company, RFQ number, or subject..."
                className="w-full px-3 py-2 pl-9 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm placeholder:text-slate-300 dark:placeholder:text-white/30 focus:outline-none focus:border-gold transition-all duration-200"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/60">
                <Search size={16} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg mb-6 text-sm border border-danger/30 bg-danger/10 text-danger relative z-10">
          {error}
        </div>
      )}

      <div className="border border-border-light dark:border-white/10 rounded-xl relative z-10 bg-white dark:bg-navy shadow-card overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border-light dark:border-white/10 bg-ivory dark:bg-navy-light">
                <th scope="col" className="px-5 py-3.5 text-left text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60 font-mono">RFQ Serial</th>
                <th scope="col" className="px-5 py-3.5 text-left text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60 font-mono">Client Partner</th>
                <th scope="col" className="px-5 py-3.5 text-left text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60 font-mono">Status</th>
                <th scope="col" className="px-5 py-3.5 text-left text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60 font-mono">Priority SLA</th>
                <th scope="col" className="px-5 py-3.5 text-left text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60 font-mono">Date</th>
                <th scope="col" className="px-5 py-3.5 text-right text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60 font-mono">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileSearch size={32} className="text-slate-300 dark:text-white/30" />
                      <p className="text-sm font-mono text-slate-400 dark:text-white/60">No records match your filter criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rfqs.map((rfq) => (
                  <tr
                    key={rfq.id}
                    onClick={() => handleEditRFQ(rfq)}
                    className={`border-b border-border-light dark:border-white/5 transition-all duration-150 hover:shadow-gold hover:bg-gold/[0.02] cursor-pointer ${
                      rfq.priority === 'urgent' ? 'bg-danger/[0.02]' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-700 dark:text-white font-mono">{rfq.rfq_number}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-700 dark:text-white">{rfq.company_name}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider border ${statusPills[rfq.status] || ''}`}>
                        {rfq.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider border ${priorityPills[rfq.priority] || ''}`}>
                        {rfq.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm font-mono text-slate-400 dark:text-white/60">
                      {rfq.email_received_at
                        ? new Date(rfq.email_received_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '-'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (quickView?.id === rfq.id) {
                            setQuickView(null);
                            setQuickViewDetail(null);
                            return;
                          }
                          setQuickView(rfq);
                          setQuickViewLoading(true);
                          setQuickViewDetail(null);
                          try {
                            const detail = await rfqService.getRFQById(rfq.id);
                            setQuickViewDetail(detail);
                          } catch {
                            setQuickViewDetail(null);
                          } finally {
                            setQuickViewLoading(false);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-gold hover:text-gold-dark transition-colors duration-200 mr-3"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={(e) => handleSyncToBusinessCentral(rfq, e)}
                        disabled={syncingId === rfq.id}
                        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-gold hover:text-gold-dark transition-colors duration-200 mr-3 disabled:opacity-60"
                      >
                        {syncingId === rfq.id ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        Sync BC
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditRFQ(rfq); }}
                        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-navy dark:text-gold hover:text-navy-light dark:hover:text-gold-light transition-colors duration-200"
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </div>

      {quickView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy rounded-xl shadow-card border border-border-light dark:border-white/10 p-6 max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto animate-fadeInUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-white font-mono">{quickView.rfq_number}</h3>
              <button onClick={() => { setQuickView(null); setQuickViewDetail(null); }} className="text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-white/60">Company</span>
                <span className="text-slate-700 dark:text-white font-medium">{quickView.company_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-white/60">Status</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider border ${statusPills[quickView.status] || ''}`}>{quickView.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-white/60">Priority</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider border ${priorityPills[quickView.priority] || ''}`}>{quickView.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-white/60">Date</span>
                <span className="text-slate-700 dark:text-white font-mono">{quickView.email_received_at ? new Date(quickView.email_received_at).toLocaleDateString() : '-'}</span>
              </div>
            </div>

            {quickViewLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={20} className="animate-spin text-gold" />
              </div>
            )}

            {quickViewDetail && quickViewDetail.items && quickViewDetail.items.length > 0 && (
              <div className="border-t border-border-light dark:border-white/10 pt-4">
                <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60 mb-3">Order Items</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border-light dark:border-white/10">
                        <th className="text-left py-2 pr-2 font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-white/60">Item</th>
                        <th className="text-left py-2 pr-2 font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-white/60">Code</th>
                        <th className="text-right py-2 pr-2 font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-white/60">Qty</th>
                        <th className="text-right py-2 pr-2 font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-white/60">Unit</th>
                        <th className="text-right py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-white/60">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quickViewDetail.items.map((item, idx) => (
                        <tr key={item.id || idx} className="border-b border-border-light dark:border-white/5">
                          <td className="py-2 pr-2 text-slate-700 dark:text-white">{item.item_name || item.description || '-'}</td>
                          <td className="py-2 pr-2 text-slate-400 dark:text-white/60 font-mono">{item.item_code || '-'}</td>
                          <td className="py-2 pr-2 text-right text-slate-700 dark:text-white font-mono">{item.quantity}</td>
                          <td className="py-2 pr-2 text-right text-slate-400 dark:text-white/60 font-mono">{item.unit || '-'}</td>
                          <td className="py-2 text-right text-slate-700 dark:text-white font-mono">
                            {item.total_price ? `$${parseFloat(item.total_price).toFixed(2)}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {quickViewDetail && quickViewDetail.items && quickViewDetail.items.length === 0 && (
              <div className="border-t border-border-light dark:border-white/10 pt-4">
                <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60 mb-3">Order Items</p>
                {quickViewDetail.items_description ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 dark:text-white/60">Description</span>
                      <span className="text-slate-700 dark:text-white text-right max-w-[60%]">{quickViewDetail.items_description}</span>
                    </div>
                    {quickViewDetail.quantity && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 dark:text-white/60">Quantity</span>
                        <span className="text-slate-700 dark:text-white font-mono">{quickViewDetail.quantity}</span>
                      </div>
                    )}
                    {quickViewDetail.specifications && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 dark:text-white/60">Specifications</span>
                        <span className="text-slate-700 dark:text-white text-right max-w-[60%]">{quickViewDetail.specifications}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-white/60 italic">No items recorded</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {editRFQ && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => { setEditRFQ(null); setEditDetail(null); }} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-navy shadow-xl border-l border-border-light dark:border-white/10 animate-slideInRight overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-navy border-b border-border-light dark:border-white/10 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-slate-700 dark:text-white font-mono">
                Edit {editRFQ.rfq_number}
              </h2>
              <button onClick={() => { setEditRFQ(null); setEditDetail(null); }} className="text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            {editLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-gold" />
              </div>
            ) : editDetail ? (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60 font-mono">RFQ Number</label>
                    <input type="text" value={editDetail.rfq_number || ''} onChange={(e) => handleEditChange('rfq_number', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60 font-mono">Company</label>
                    <input type="text" value={editDetail.company_name || ''} onChange={(e) => handleEditChange('company_name', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60 font-mono">Status</label>
                    <select value={editDetail.status || 'pending'} onChange={(e) => handleEditChange('status', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold">
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                      <option value="fulfilled">Fulfilled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60 font-mono">Priority</label>
                    <select value={editDetail.priority || 'medium'} onChange={(e) => handleEditChange('priority', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60 font-mono">Email Subject</label>
                    <input type="text" value={editDetail.email_subject || ''} onChange={(e) => handleEditChange('email_subject', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60 font-mono">Email Sender</label>
                    <input type="text" value={editDetail.email_sender || ''} onChange={(e) => handleEditChange('email_sender', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold" />
                  </div>
                </div>

                <div className="border-t border-border-light dark:border-white/10 pt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-3 text-slate-400 dark:text-white/60 font-mono">Supplier Assignment</p>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60 font-mono">Select Supplier</label>
                      <select
                        value={selectedSupplier || ''}
                        onChange={(e) => setSelectedSupplier(e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold transition-all duration-200"
                      >
                        <option value="">No supplier selected</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.company_name} {supplier.email ? `(${supplier.email})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleAssignSupplier}
                        disabled={!selectedSupplier || saving}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save size={16} />
                        Assign Supplier
                      </button>
                      <button
                        type="button"
                        onClick={handleDispatchToSupplier}
                        disabled={!selectedSupplier || dispatching}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gold text-white hover:bg-gold-dark text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Mail size={16} />
                        {dispatching ? 'Sending...' : 'Send RFQ Email'}
                      </button>
                    </div>
                    {editDetail && editDetail.supplier_email_sent && (
                      <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                        <span className="font-mono">Email sent to {editDetail.supplier_email} at {editDetail.supplier_email_sent_at ? new Date(editDetail.supplier_email_sent_at).toLocaleString() : ''}</span>
                      </div>
                    )}
                    {editDetail && editDetail.supplier_email_error && (
                      <div className="flex items-center gap-2 text-xs text-danger">
                        <span className="font-mono">Email error: {editDetail.supplier_email_error}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-border-light dark:border-white/10 pt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-3 text-slate-400 dark:text-white/60 font-mono">Order Details</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60 font-mono">Budget ($)</label>
                      <input type="number" step="0.01" value={editDetail.budget || ''} onChange={(e) => handleEditChange('budget', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60 font-mono">Delivery Date</label>
                      <input type="date" value={editDetail.delivery_date || ''} onChange={(e) => handleEditChange('delivery_date', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60 font-mono">Items</p>
                    <button type="button" onClick={handleAddItem}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-gold/10 text-gold border border-gold/30 rounded hover:bg-gold/20 transition-all"
                    >
                      + Add Item
                    </button>
                  </div>
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border-light dark:border-white/10">
                          <th className="text-left py-2 pr-2 font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-white/60">Code</th>
                          <th className="text-left py-2 pr-2 font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-white/60">Description</th>
                          <th className="text-right py-2 pr-2 font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-white/60">Qty</th>
                          <th className="text-left py-2 pr-2 font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-white/60">Unit</th>
                          <th className="text-right py-2 pr-2 font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-white/60">Unit $</th>
                          <th className="text-right py-2 pr-2 font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-white/60">Total $</th>
                          <th className="py-2 w-8" />
                        </tr>
                      </thead>
                      <tbody>
                        {editItems.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-6 text-center text-slate-400 dark:text-white/60 italic">No items. Click "Add Item" to add one.</td>
                          </tr>
                        ) : (
                          editItems.map((item, idx) => (
                            <tr key={item.id || `new-${idx}`} className="border-b border-border-light dark:border-white/5">
                              <td className="py-1.5 pr-2">
                                <input type="text" value={item.item_code || ''} onChange={(e) => handleItemChange(idx, 'item_code', e.target.value)}
                                  className="w-full px-2 py-1 rounded bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-xs focus:outline-none focus:border-gold" />
                              </td>
                              <td className="py-1.5 pr-2">
                                <input type="text" value={item.description || ''} onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                  className="w-full px-2 py-1 rounded bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-xs focus:outline-none focus:border-gold" />
                              </td>
                              <td className="py-1.5 pr-2">
                                <input type="number" value={item.quantity || ''} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value === '' ? 0 : Number(e.target.value))}
                                  className="w-16 px-2 py-1 rounded bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-xs text-right focus:outline-none focus:border-gold" />
                              </td>
                              <td className="py-1.5 pr-2">
                                <input type="text" value={item.unit || ''} onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                  className="w-14 px-2 py-1 rounded bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-xs focus:outline-none focus:border-gold" />
                              </td>
                              <td className="py-1.5 pr-2">
                                <input type="number" step="0.01" value={item.unit_price || ''} onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value === '' ? null : Number(e.target.value))}
                                  className="w-20 px-2 py-1 rounded bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-xs text-right focus:outline-none focus:border-gold" />
                              </td>
                              <td className="py-1.5 pr-2">
                                <input type="number" step="0.01" value={item.total_price || ''} onChange={(e) => handleItemChange(idx, 'total_price', e.target.value === '' ? null : Number(e.target.value))}
                                  className="w-20 px-2 py-1 rounded bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-xs text-right focus:outline-none focus:border-gold" />
                              </td>
                              <td className="py-1.5">
                                <button type="button" onClick={() => handleRemoveItem(idx)}
                                  className="text-danger/60 hover:text-danger transition-colors">
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t border-border-light dark:border-white/10 pt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-3 text-slate-400 dark:text-white/60 font-mono">Notes</p>
                  <textarea rows={3} value={editDetail.notes || ''} onChange={(e) => handleEditChange('notes', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-sm focus:outline-none focus:border-gold resize-none" />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border-light dark:border-white/10">
                  <button
                    onClick={() => setDeleteConfirm(editRFQ)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 text-sm font-medium transition-all duration-200"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setEditRFQ(null); setEditDetail(null); }}
                      className="px-4 py-2.5 rounded-lg border border-border-light dark:border-white/20 text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white text-sm transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold text-white rounded-lg text-sm font-semibold hover:bg-gold-dark transition-all duration-200 disabled:opacity-50"
                    >
                      <Save size={16} />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy rounded-xl shadow-card border border-border-light dark:border-white/10 p-6 max-w-sm w-full mx-4 animate-fadeInUp">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-white mb-2">Delete RFQ</h3>
            <p className="text-sm text-slate-400 dark:text-white/60 mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-white">{deleteConfirm.rfq_number}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-border-light dark:border-white/20 text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white text-sm transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditDelete}
                className="px-4 py-2 rounded-lg bg-danger text-white text-sm font-semibold hover:bg-danger/90 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFQList;

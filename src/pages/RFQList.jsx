import React, { useState, useEffect } from 'react';
import rfqService from '../services/rfqService';
import { Search, Eye, FileSearch, X, Loader2 } from 'lucide-react';

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
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [quickView, setQuickView] = useState(null);

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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] gap-3">
        <Loader2 size={32} className="animate-spin text-gold" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/60">Loading documents...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
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

      <div className="border border-border-light dark:border-white/10 rounded-xl overflow-hidden relative z-10 bg-white dark:bg-navy shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border-light dark:border-white/10 bg-ivory dark:bg-navy-light">
                <th scope="col" className="px-5 py-3.5 text-left text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60 font-mono">RFQ Serial</th>
                <th scope="col" className="px-5 py-3.5 text-left text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60 font-mono">Client Partner</th>
                <th scope="col" className="px-5 py-3.5 text-left text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60 font-mono">Status</th>
                <th scope="col" className="px-5 py-3.5 text-left text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60 font-mono">Priority SLA</th>
                <th scope="col" className="px-5 py-3.5 text-left text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60 font-mono">Date</th>
                <th scope="col" className="px-5 py-3.5 text-left text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60 font-mono">AI Audit</th>
                <th scope="col" className="px-5 py-3.5 text-right text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60 font-mono">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center">
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
                    className={`border-b border-border-light dark:border-white/5 transition-all duration-150 hover:shadow-gold hover:bg-gold/[0.02] ${
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
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {rfq.ai_processed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono bg-gold/10 text-gold border border-dashed border-gold/40">
                          Parsed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono bg-ivory dark:bg-navy-light text-slate-400 dark:text-white/60 border border-dashed border-border-light dark:border-white/20">
                          Unprocessed
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <button
                        onClick={() => setQuickView(quickView?.id === rfq.id ? null : rfq)}
                        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-gold hover:text-gold-dark transition-colors duration-200 mr-4"
                      >
                        <Eye size={14} />
                        Quick View
                      </button>
                      <button className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-navy dark:text-gold hover:text-navy-light dark:hover:text-gold-light transition-colors duration-200">
                        <FileSearch size={14} />
                        Audit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {quickView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy rounded-xl shadow-card border border-border-light dark:border-white/10 p-6 max-w-md w-full mx-4 animate-fadeInUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-white font-mono">{quickView.rfq_number}</h3>
              <button onClick={() => setQuickView(null)} className="text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-400 dark:text-white/60">Company</span><span className="text-slate-700 dark:text-white font-medium">{quickView.company_name}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 dark:text-white/60">Status</span><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider border ${statusPills[quickView.status] || ''}`}>{quickView.status}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 dark:text-white/60">Priority</span><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider border ${priorityPills[quickView.priority] || ''}`}>{quickView.priority}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 dark:text-white/60">Date</span><span className="text-slate-700 dark:text-white font-mono">{quickView.email_received_at ? new Date(quickView.email_received_at).toLocaleDateString() : '-'}</span></div>
              {quickView.ai_processed && (
                <div className="pt-3 border-t border-border-light dark:border-white/10">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60 mb-2">AI Analysis</p>
                  <pre className="text-xs bg-navy dark:bg-navy-dark text-gold p-3 rounded-lg overflow-x-auto font-mono">
                    {JSON.stringify(quickView.ai_analysis || { status: 'parsed', confidence: 'high' }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFQList;

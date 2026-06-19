import React, { useState, useEffect } from 'react';
import rfqService from '../services/rfqService';
import {
  Inbox,
  Clock,
  CheckCircle,
  Activity,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const sparklineData = [
  { v: 12 }, { v: 19 }, { v: 8 }, { v: 15 }, { v: 22 },
  { v: 14 }, { v: 18 }, { v: 25 }, { v: 20 }, { v: 16 },
  { v: 24 }, { v: 21 }, { v: 17 }, { v: 23 },
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, analyticsData] = await Promise.all([
        rfqService.getDashboardStats(),
        rfqService.getAnalytics(),
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] gap-3">
        <Loader2 size={32} className="animate-spin text-gold" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/60">Loading telemetry...</span>
      </div>
    );
  }

  const statCards = stats
    ? [
        { label: 'Total RFQs', value: stats.total_rfqs, icon: Inbox, color: 'text-slate-700 dark:text-white', bgColor: 'bg-gold/10', borderColor: 'border-gold/30', sub: 'All time documents' },
        { label: 'Pending', value: stats.pending_rfqs, icon: Clock, color: 'text-amber', bgColor: 'bg-amber/10', borderColor: 'border-amber/30', sub: 'Awaiting review' },
        { label: 'Completed (Month)', value: stats.completed_rfqs, icon: CheckCircle, color: 'text-emerald', bgColor: 'bg-emerald/10', borderColor: 'border-emerald/30', sub: 'This month' },
        { label: 'Response Rate', value: stats.total_rfqs > 0 ? `${((stats.completed_rfqs / stats.total_rfqs) * 100).toFixed(0)}%` : 'N/A', icon: Activity, color: 'text-gold', bgColor: 'bg-gold/10', borderColor: 'border-gold/30', sub: 'Completion rate' },
      ]
    : [];

  const getProgressColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed' || s === 'fulfilled') return 'bg-emerald';
    if (s === 'pending' || s === 'processing') return 'bg-amber';
    return 'bg-gold';
  };

  const getPriorityColor = (priority) => {
    const p = priority?.toLowerCase();
    if (p === 'urgent') return 'bg-danger';
    if (p === 'high') return 'bg-amber';
    if (p === 'medium') return 'bg-gold';
    return 'bg-slate-300 dark:bg-white/20';
  };

  return (
    <div className="min-h-screen">
      <div className="glow glow-gold left-1/3 top-10" />
      <div className="glow glow-navy right-1/4 bottom-10" />

      <div className="mb-8 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-700 dark:text-white mb-1">
            Dashboard <span className="text-gold">Performance</span>
          </h1>
          <p className="text-sm text-slate-400 dark:text-white/60">
            Pipeline metrics, status distribution, and system analytics.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-light dark:border-white/20 text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white hover:border-gold transition-all duration-200 text-xs font-mono tracking-wider"
        >
          <RefreshCw size={14} />
          SYNC
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg mb-6 text-sm border border-danger/30 bg-danger/10 text-danger relative z-10">
          {error}
        </div>
      )}

      {stats && (
        <div className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`border ${card.borderColor} rounded-xl p-5 bg-white dark:bg-navy shadow-card card-hover relative overflow-hidden`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60">{card.label}</span>
                    <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center ${card.color}`}>
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold tracking-tight ${card.color}`}>
                      {card.value}
                    </span>
                  </div>
                  <p className="text-[9px] font-mono mt-1 uppercase tracking-wider text-slate-400 dark:text-white/60">{card.sub}</p>
                  <div className="mt-3 h-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparklineData}>
                        <Line type="monotone" dataKey="v" stroke="#C6A95E" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-border-light dark:border-white/10 rounded-xl p-6 bg-white dark:bg-navy shadow-card">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-border-light dark:border-white/10">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-white flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-gold" />
                  Pipeline State Audit
                </h3>
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60">Status Distribution</span>
              </div>

              <div className="space-y-5">
                {stats.status_breakdown?.length > 0 ? (
                  stats.status_breakdown.map((item) => {
                    const percentage = stats.total_rfqs > 0 ? (item.count / stats.total_rfqs) * 100 : 0;
                    return (
                      <div key={item.status} className="space-y-1.5 font-mono">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700 dark:text-white uppercase">{item.status}</span>
                          <span className="text-slate-400 dark:text-white/60">{item.count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-ivory dark:bg-navy-light border border-border-light dark:border-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(item.status)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-center py-6 font-mono text-slate-400 dark:text-white/60">
                    No active distribution metrics
                  </p>
                )}
              </div>
            </div>

            <div className="border border-border-light dark:border-white/10 rounded-xl p-6 bg-white dark:bg-navy shadow-card">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-border-light dark:border-white/10">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-white flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-navy dark:bg-gold" />
                  SLA Urgency Levels
                </h3>
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60">Priority Distribution</span>
              </div>

              <div className="space-y-5">
                {stats.priority_breakdown?.length > 0 ? (
                  stats.priority_breakdown.map((item) => {
                    const percentage = stats.total_rfqs > 0 ? (item.count / stats.total_rfqs) * 100 : 0;
                    return (
                      <div key={item.priority} className="space-y-1.5 font-mono">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700 dark:text-white uppercase">{item.priority}</span>
                          <span className="text-slate-400 dark:text-white/60">{item.count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-ivory dark:bg-navy-light border border-border-light dark:border-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${getPriorityColor(item.priority)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-center py-6 font-mono text-slate-400 dark:text-white/60">
                    No active urgency levels
                  </p>
                )}
              </div>
            </div>
          </div>

          {analytics && (
            <div className="border border-border-light dark:border-white/10 rounded-xl p-6 bg-white dark:bg-navy shadow-card relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-border-light dark:border-white/10">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-white flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-gold" />
                  System Performance Matrix (Last 30 Days)
                </h3>
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60">Telemetry Logs</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-4 rounded-lg border border-border-light dark:border-white/10 bg-ivory dark:bg-navy-light">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60">Ingested Total</p>
                  <p className="text-xl font-bold text-slate-700 dark:text-white mt-1 font-mono">{analytics.total_rfqs_received}</p>
                  <p className="text-[9px] mt-2 font-mono uppercase tracking-wider text-slate-400 dark:text-white/60">Raw emails received</p>
                  <div className="mt-2 h-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparklineData}>
                        <Line type="monotone" dataKey="v" stroke="#C6A95E" strokeWidth={1} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-border-light dark:border-white/10 bg-ivory dark:bg-navy-light">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60">AI Processed</p>
                  <p className="text-xl font-bold text-gold mt-1 font-mono">{analytics.total_rfqs_processed}</p>
                  <p className="text-[9px] mt-2 font-mono uppercase tracking-wider text-slate-400 dark:text-white/60">Automated parsing</p>
                  <div className="mt-2 h-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparklineData}>
                        <Line type="monotone" dataKey="v" stroke="#C6A95E" strokeWidth={1} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-border-light dark:border-white/10 bg-ivory dark:bg-navy-light">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60">Avg Latency</p>
                  <p className="text-xl font-bold text-emerald mt-1 font-mono">
                    {analytics.avg_processing_time_hours ? `${analytics.avg_processing_time_hours.toFixed(1)}h` : 'N/A'}
                  </p>
                  <p className="text-[9px] mt-2 font-mono uppercase tracking-wider text-slate-400 dark:text-white/60">Processing time</p>
                  <div className="mt-2 h-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparklineData}>
                        <Line type="monotone" dataKey="v" stroke="#C6A95E" strokeWidth={1} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-border-light dark:border-white/10 bg-ivory dark:bg-navy-light">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60">Model Confidence</p>
                  <p className="text-xl font-bold text-navy dark:text-gold mt-1 font-mono">
                    {analytics.avg_ai_confidence_score ? `${(analytics.avg_ai_confidence_score * 100).toFixed(1)}%` : 'N/A'}
                  </p>
                  <p className="text-[9px] mt-2 font-mono uppercase tracking-wider text-slate-400 dark:text-white/60">Extraction accuracy</p>
                  <div className="mt-2 h-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparklineData}>
                        <Line type="monotone" dataKey="v" stroke="#C6A95E" strokeWidth={1} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

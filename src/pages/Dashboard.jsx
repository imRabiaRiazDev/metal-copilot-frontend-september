import React, { useState, useEffect } from 'react';
import rfqService from '../services/rfqService';
import PageHeader from '../components/PageHeader';
import {
  Inbox,
  Mail,
  Cpu,
  Loader2,
  DollarSign,
  BarChart3,
  Activity,
  LayoutDashboard,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#D19E2C', '#0B2048', '#3B82F6', '#008F6A', '#E8822A', '#D61A0A', '#7C5CFC'];

const TICK_FILL = '#64748B';
const GRID_STROKE = 'rgba(100, 116, 139, 0.16)';

const formatCost = (val) => {
  const n = parseFloat(val);
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(4)}`;
};

const formatTokens = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy dark:bg-navy-dark border border-white/20 rounded-lg px-3 py-2 shadow-elevated">
      {label && <p className="text-[10px] font-mono text-white/60 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-xs text-white">
          {p.name}: {p.name === 'cost' ? formatCost(p.value) : p.name === 'Input Tokens' || p.name === 'Output Tokens' ? formatTokens(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [aiUsage, setAiUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, analyticsData, aiUsageData] = await Promise.all([
        rfqService.getDashboardStats(),
        rfqService.getAnalytics(),
        rfqService.getAiUsage({ days: 30 }),
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
      setAiUsage(aiUsageData);
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

  const totals = aiUsage?.totals || {};
  const dailyCosts = aiUsage?.cost_by_day || [];
  const byModel = aiUsage?.cost_by_model || [];
  const byUse = aiUsage?.cost_by_use || [];

  const costChartData = dailyCosts.map((d) => ({
    date: d.date.length >= 10 ? `${d.date.slice(8, 10)}/${d.date.slice(5, 7)}` : d.date,
    cost: parseFloat(d.cost),
    input: d.input_tokens,
    output: d.output_tokens,
  }));

  const modelChartData = byModel.map((m) => ({
    name: `${m.model}`,
    requests: m.requests,
    cost: parseFloat(m.cost),
    tokens: m.input_tokens + m.output_tokens,
  }));

  const useChartData = byUse.map((u) => ({
    name: u.use,
    value: u.requests,
    cost: parseFloat(u.cost),
    tokens: u.input_tokens + u.output_tokens,
  }));

  const statCards = [
    {
      label: 'Total RFQs',
      value: analytics?.total_orders_received || stats?.total_rfqs || 0,
      icon: Inbox,
      iconClass: 'bg-gold/10 text-gold',
      sub: 'Last 30 days',
    },
    {
      label: 'Emails Synced',
      value: analytics?.total_orders_received || 0,
      icon: Mail,
      iconClass: 'bg-blue-500/10 text-blue-500',
      sub: 'From inbox',
    },
    {
      label: 'AI Processed',
      value: analytics?.total_orders_processed || 0,
      icon: Cpu,
      iconClass: 'bg-emerald/10 text-emerald',
      sub: 'Automated parsing',
    },
    {
      label: 'AI Cost (30d)',
      value: formatCost(totals.total_cost || 0),
      icon: DollarSign,
      iconClass: 'bg-emerald/10 text-emerald',
      sub: `${formatTokens(totals.input_tokens || 0)} in / ${formatTokens(totals.output_tokens || 0)} out`,
    },
    {
      label: 'API Requests',
      value: totals.requests || 0,
      icon: Activity,
      iconClass: 'bg-violet-500/10 text-violet-500',
      sub: `${aiUsage?.days || 30} day window`,
    },
    {
      label: 'Model Confidence',
      value: analytics?.avg_ai_confidence_score
        ? `${(analytics.avg_ai_confidence_score * 100).toFixed(1)}%`
        : 'N/A',
      icon: Cpu,
      iconClass: 'bg-gold/10 text-gold',
      sub: 'Extraction accuracy',
    },
  ];

  const axisTick = { fontSize: 10, fill: TICK_FILL };

  return (
    <div className="min-h-screen animate-fadeInUp">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        accent="Performance"
        subtitle="Pipeline metrics and AI usage analytics."
      />

      {error && (
        <div className="px-4 py-3 rounded-lg mb-6 text-sm border border-danger/30 bg-danger/10 text-danger">
          {error}
        </div>
      )}

      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="card p-5 card-hover">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60">{card.label}</span>
                  <div className={`w-10 h-10 rounded-lg ${card.iconClass} flex items-center justify-center`}>
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-slate-700 dark:text-white tabular-nums">{card.value}</span>
                </div>
                <p className="text-[9px] font-mono mt-1.5 uppercase tracking-wider text-slate-400 dark:text-white/60">{card.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="card p-6 xl:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-gold" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-white">AI Cost Trend (30 Days)</h3>
            </div>
            <div className="h-64">
              {costChartData.some((d) => d.cost > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={costChartData}>
                    <defs>
                      <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D19E2C" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#D19E2C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                    <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={false} />
                    <YAxis tick={axisTick} tickLine={false} axisLine={false} tickFormatter={formatCost} width={50} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="cost" name="cost" stroke="#D19E2C" fill="url(#costGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 dark:text-white/40 text-sm">No usage data yet</div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={18} className="text-gold" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-white">Usage by Model</h3>
            </div>
            <div className="h-64">
              {modelChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modelChartData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
                    <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} tickFormatter={formatCost} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 9, fill: TICK_FILL }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="cost" name="cost" radius={[0, 4, 4, 0]}>
                      {modelChartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 dark:text-white/40 text-sm">No model data</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-gold" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-white">Usage by Type</h3>
            </div>
            <div className="h-56">
              {useChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={useChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {useChartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} requests`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 dark:text-white/40 text-sm">No usage type data</div>
              )}
            </div>
            {useChartData.length > 0 && (
              <div className="mt-4 space-y-2">
                {useChartData.map((u, i) => (
                  <div key={u.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-700 dark:text-white/80 capitalize">{u.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 dark:text-white/60">
                      <span>{u.value} req</span>
                      <span>{formatTokens(u.tokens)}</span>
                      <span className="font-mono">{formatCost(u.cost)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-gold" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-white">Token Usage (30 Days)</h3>
            </div>
            <div className="h-56">
              {costChartData.some((d) => d.input > 0 || d.output > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={costChartData}>
                    <defs>
                      <linearGradient id="inputGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="outputGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                    <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={false} />
                    <YAxis tick={axisTick} tickLine={false} axisLine={false} tickFormatter={formatTokens} width={50} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="input" name="Input Tokens" stroke="#3b82f6" fill="url(#inputGrad)" strokeWidth={1.5} dot={false} />
                    <Area type="monotone" dataKey="output" name="Output Tokens" stroke="#10b981" fill="url(#outputGrad)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 dark:text-white/40 text-sm">No token data yet</div>
              )}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/60">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Input
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/60">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Output
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

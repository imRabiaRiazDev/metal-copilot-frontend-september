import React, { useEffect, useState } from 'react';
import { getProtectedData, getToken } from '../services/authService';
import { Link } from 'react-router-dom';
import {
  FileText,
  BarChart3,
  Users,
  KanbanSquare,
  ArrowRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [protectedData, setProtectedData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUserData(JSON.parse(storedUser));

    const fetchProtectedData = async () => {
      try {
        const token = getToken();
        if (token) {
          const data = await getProtectedData(token);
          setProtectedData(data);
        }
      } catch (error) {
        console.error('Failed to fetch protected data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProtectedData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    { label: 'Operator', value: userData?.username || 'N/A', mono: true },
    { label: 'Email', value: userData?.email || 'N/A', mono: false },
    { label: 'UUID', value: userData?.id ? `${userData.id.substring(0, 8)}...` : 'N/A', mono: true },
  ];

  const quickActions = [
    { path: '/contacts', label: 'New Contact', icon: Users, desc: 'Add a supplier or client' },
    { path: '/deals', label: 'View Pipeline', icon: KanbanSquare, desc: 'Track RFQs, quotes & orders' },
    { path: '/rfqs', label: 'New RFQ', icon: FileText, desc: 'Create a request for quotation' },
    { path: '/dashboard', label: 'Analytics', icon: BarChart3, desc: 'Review performance metrics' },
  ];

  return (
    <div className="min-h-screen">
      <div className="glow glow-gold right-10 top-10" />

      <div className="mb-10 relative z-10">
        <h1 className="text-3xl font-bold text-slate-700 dark:text-white mb-1">
          {getGreeting()}, <span className="text-gold">{userData?.username || 'Operator'}</span>
        </h1>
        <div className="w-16 h-0.5 bg-gold/50 mt-2 mb-4" />
        <p className="text-sm text-slate-400 dark:text-white/60 max-w-xl">
          AI-powered metal trading copilot. Manage contacts, deals, and documents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="border border-border-light dark:border-white/10 rounded-xl p-6 bg-white dark:bg-navy relative overflow-hidden shadow-card card-hover">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-white">
                    {userData ? userData.username : 'Operator'}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider bg-gold/10 text-gold border border-gold/20">
                    System Operator
                  </span>
                </div>
              </div>
              <div className="text-right font-mono text-[11px] text-slate-400 dark:text-white/60">
                <p>Session</p>
                <p className="font-semibold text-emerald dark:text-emerald mt-0.5">Active</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-border-light dark:border-white/10">
              {statCards.map((stat) => (
                <div key={stat.label} className="p-3.5 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/10">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60">{stat.label}</p>
                  <p className={`text-sm font-semibold mt-1 truncate text-slate-700 dark:text-white ${stat.mono ? 'font-mono' : ''}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className="border border-border-light dark:border-white/10 rounded-xl p-6 bg-white dark:bg-navy shadow-card card-hover group block"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold mb-4 group-hover:bg-gold/20 transition-colors duration-200">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <h4 className="text-base font-semibold text-slate-700 dark:text-white mb-1.5">{action.label}</h4>
                  <p className="text-xs text-slate-400 dark:text-white/60 leading-relaxed mb-4">
                    {action.desc}
                  </p>
                  <span className="text-xs font-semibold text-gold flex items-center gap-1.5 group-hover:gap-2 transition-all duration-200">
                    Open <ArrowRight size={12} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-border-light dark:border-white/10 rounded-xl overflow-hidden flex flex-col h-full min-h-[400px] bg-white dark:bg-navy shadow-card">
            <div className="px-4 py-3 flex items-center justify-between bg-ivory dark:bg-navy-light border-b border-border-light dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-danger" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald" />
              </div>
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60">api_handshake.sh</span>
            </div>

            <div className="p-5 flex-1 flex flex-col font-mono text-xs overflow-hidden bg-navy dark:bg-navy-dark">
              <div className="mb-4">
                <span className="text-gold/60">$</span>{' '}
                <span className="text-white">curl -H "Authorization: Bearer JWT" /api/auth/protected/</span>
              </div>

              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-white/40 gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-gold border-t-transparent rounded-full" />
                  <span className="text-[10px] uppercase tracking-wider">Querying endpoint...</span>
                </div>
              ) : protectedData ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald/10 border border-emerald/20 text-emerald text-[11px] mb-4">
                    <CheckCircle size={14} />
                    Handshake secure: {protectedData.message}
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 rounded-lg bg-navy-dark/50 border border-white/10">
                    <pre className="text-[11px] leading-relaxed text-gold select-text">
                      {JSON.stringify(protectedData, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-[11px]">
                  <XCircle size={14} />
                  Access failure: unable to query credentials.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

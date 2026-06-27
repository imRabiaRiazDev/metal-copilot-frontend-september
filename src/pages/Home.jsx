import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  BarChart3,
  Users,
  KanbanSquare,
  ArrowRight,
} from 'lucide-react';

const Home = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUserData(JSON.parse(storedUser));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

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

      <div className="relative z-10">
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
    </div>
  );
};

export default Home;

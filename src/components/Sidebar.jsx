import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  KanbanSquare,
  CheckSquare,
  ShoppingCart,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/deals', label: 'Pipeline', icon: KanbanSquare },
  { path: '/rfqs', label: 'RFQs', icon: FileText },
  { path: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
  { path: '/contacts', label: 'Contacts', icon: Users },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
];

const LogoMark = () => (
  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shrink-0 shadow-gold">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8l8-5 8 5-8 5-8-5z" fill="#0B2048" />
      <path d="M4 11.5V17l8 5v-5.5l-8-5z" fill="#0B2048" opacity="0.85" />
      <path d="M20 11.5V17l-8 5v-5.5l8-5z" fill="#0B2048" opacity="0.65" />
    </svg>
  </div>
);

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const expanded = !collapsed;
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const isActive = (path) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));

  return (
    <aside className={`${expanded ? 'w-64' : 'w-16'} min-h-screen flex flex-col fixed left-0 top-0 z-20 bg-navy dark:bg-navy-dark transition-all duration-300`}>
      {/* Collapse Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-navy dark:bg-navy-dark border border-white/20 rounded-full flex items-center justify-center text-gold hover:bg-gold/20 transition-all duration-200 z-30"
        title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {expanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <button
        onClick={() => navigate('/dashboard')}
        className={`p-5 border-b border-white/10 w-full text-left transition-colors duration-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${expanded ? '' : 'px-3'}`}
        title="Go to dashboard"
        aria-label="Co.Ri.Metal Copilot - Go to dashboard"
      >
        <div className="flex items-center gap-3">
          <LogoMark />
          {expanded && (
            <div className="min-w-0">
              <h1 className="text-base font-bold text-white tracking-tight leading-none">
                Co.Ri.Metal
              </h1>
              <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-gold/80 mt-1">
                Copilot
              </p>
            </div>
          )}
        </div>
      </button>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${
                active
                  ? 'bg-gold/10 text-gold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              } ${expanded ? '' : 'justify-center'}`}
              title={item.label}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-gold" />
              )}
              <Icon size={18} strokeWidth={1.5} className="shrink-0" />
              {expanded && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`p-3 border-t border-white/10 ${expanded ? '' : 'px-2'}`}>
        <button
          onClick={() => navigate('/settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${expanded ? '' : 'justify-center px-2'}`}
          title="Open settings"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-xs font-bold text-navy shrink-0">
            {(user?.username || 'OP').substring(0, 2).toUpperCase()}
          </div>
          {expanded && (
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-medium text-white truncate max-w-[130px]">{user?.username || 'Operator'}</p>
              <p className="text-[9px] font-mono uppercase tracking-wider text-white/40">Operator</p>
            </div>
          )}
          {expanded && <Settings size={15} className="text-white/40 shrink-0" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

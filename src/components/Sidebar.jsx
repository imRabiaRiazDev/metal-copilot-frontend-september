import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  FileText,
  Users,
  KanbanSquare,
  CheckSquare,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
} from 'lucide-react';
import { logout } from '../services/authService';

const menuGroups = [
  {
    label: 'Main',
    items: [
      { path: '/home', label: 'Home', icon: Home },
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/rfqs', label: 'RFQ List', icon: FileText },
      { path: '/contacts', label: 'Contacts', icon: Users },
      { path: '/deals', label: 'Deals Pipeline', icon: KanbanSquare },
      { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 min-h-screen flex flex-col fixed left-0 top-0 z-20 bg-navy dark:bg-navy-dark">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
            <KanbanSquare size={18} className="text-gold" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              Co.Ri.Metal
            </h1>
            <p className="text-[9px] font-mono tracking-widest uppercase text-gold/70">
              Copilot
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
        {menuGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[9px] font-mono uppercase tracking-widest text-white/40">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group relative transition-all duration-200 ${
                      active
                        ? 'bg-white/10 text-gold'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.5} className="shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {active && (
                      <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-gold" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-2">
        {user?.username && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gold bg-gold/20">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-mono uppercase tracking-wider text-white/40">Operator</p>
              <p className="text-sm font-medium text-white truncate max-w-[130px]">{user.username}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setDark(!dark)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm"
        >
          {dark ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
          <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm"
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span>Disconnect</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

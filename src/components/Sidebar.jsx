import React, { useState, useEffect, useRef } from 'react';
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
import { logout, getMicrosoftStatus, microsoftLogin, disconnectMicrosoft } from '../services/authService';

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
  const [msStatus, setMsStatus] = useState(null);
  const [msLoading, setMsLoading] = useState(false);
  const msPopupRef = useRef(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getMicrosoftStatus();
        setMsStatus(data);
      } catch {
        setMsStatus({ connected: false });
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'MICROSOFT_AUTH') {
        const { connected, email } = event.data.payload;
        setMsStatus({ connected, email: email || 'Connected' });
        setMsLoading(false);
        closePopup();
      }
    };

    const closePopup = () => {
      if (msPopupRef.current && !msPopupRef.current.closed) {
        msPopupRef.current.close();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnectOutlook = async () => {
    setMsLoading(true);
    try {
      const response = await microsoftLogin();
      if (response.success && response.auth_url) {
        const width = 600;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        msPopupRef.current = window.open(
          response.auth_url,
          'Microsoft Login',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`,
        );
        if (!msPopupRef.current) {
          setMsLoading(false);
          return;
        }

        const AUTH_RESULT_KEY = 'microsoft_auth_result';
        const poll = setInterval(() => {
          const raw = localStorage.getItem(AUTH_RESULT_KEY);
          if (raw) {
            clearInterval(poll);
            localStorage.removeItem(AUTH_RESULT_KEY);
            try {
              const { connected, email } = JSON.parse(raw);
              setMsStatus({ connected, email: email || 'Connected' });
              setMsLoading(false);
              if (msPopupRef.current && !msPopupRef.current.closed) {
                msPopupRef.current.close();
              }
            } catch {
              setMsLoading(false);
            }
            return;
          }
          if (msPopupRef.current?.closed) {
            clearInterval(poll);
            setMsLoading(false);
            getMicrosoftStatus().then(setMsStatus).catch(() => {});
          }
        }, 300);
      } else {
        setMsLoading(false);
      }
    } catch {
      setMsLoading(false);
    }
  };

  const handleDisconnectOutlook = async () => {
    try {
      await disconnectMicrosoft();
      setMsStatus({ connected: false });
    } catch {
      // ignore
    }
  };

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

        {msStatus?.connected ? (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-mono uppercase tracking-wider text-white/40">Outlook</p>
              <p className="text-xs text-white truncate max-w-[130px]">{msStatus.email}</p>
            </div>
            <button
              onClick={handleDisconnectOutlook}
              className="text-[10px] font-mono uppercase tracking-wider text-white/40 hover:text-danger transition-colors"
              title="Disconnect Outlook"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectOutlook}
            disabled={msLoading}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path d="M11.5 0V11.5V23L0 16.5V6.5L11.5 0Z" fill="#0078D4" />
              <path d="M11.5 0V11.5V23L23 16.5V6.5L11.5 0Z" fill="#106EBE" />
              <path d="M11.5 0L0 6.5L11.5 11.5L23 6.5L11.5 0Z" fill="#F3F3F3" />
              <path d="M11.5 11.5L0 6.5V16.5L11.5 11.5Z" fill="#E5E5E5" />
              <path d="M11.5 11.5L23 6.5V16.5L11.5 11.5Z" fill="#D4D4D4" />
            </svg>
            <span>{msLoading ? 'Connecting...' : 'Connect Outlook'}</span>
          </button>
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

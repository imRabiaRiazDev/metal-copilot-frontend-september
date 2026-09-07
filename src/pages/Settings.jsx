import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  LogOut,
  Loader2,
  User,
} from 'lucide-react';
import { logout, getMicrosoftStatus, microsoftLogin, disconnectMicrosoft } from '../services/authService';
import useTheme from '../hooks/useTheme';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';

const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${
      checked ? 'bg-gold' : 'bg-border-light dark:bg-white/20'
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-[22px]' : 'translate-x-0.5'
      }`}
    />
  </button>
);

const SectionCard = ({ icon: Icon, iconClass, title, description, children }) => (
  <section className="card p-6">
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-10 h-10 rounded-lg ${iconClass} flex items-center justify-center`}>
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-700 dark:text-white">{title}</h2>
        {description && <p className="text-xs text-slate-400 dark:text-white/60 mt-0.5">{description}</p>}
      </div>
    </div>
    {children}
  </section>
);

const Settings = () => {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const [msStatus, setMsStatus] = useState(null);
  const [msLoading, setMsLoading] = useState(false);
  const msPopupRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
    const closePopup = () => {
      if (msPopupRef.current && !msPopupRef.current.closed) {
        msPopupRef.current.close();
      }
    };
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'MICROSOFT_AUTH') {
        const { connected, email } = event.data.payload;
        setMsStatus({ connected, email: email || 'Connected' });
        setMsLoading(false);
        closePopup();
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
      toast.success('Outlook disconnected');
    } catch {
      toast.error('Failed to disconnect Outlook');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-full animate-fadeInUp">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        subtitle="Manage your account, appearance, and integrations."
      />

      <div className="space-y-6">
        <SectionCard icon={User} iconClass="bg-gold/10 text-gold" title="Profile" description="Your operator account">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-lg font-bold text-navy shrink-0">
              {(user?.username || 'OP').substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-700 dark:text-white">{user?.username || 'Operator'}</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/60 mt-0.5">Operator · Co.Ri.Metal Copilot</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={dark ? Moon : Sun} iconClass="bg-gold/10 text-gold" title="Appearance" description="Switch between light and dark themes">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {dark ? <Moon size={18} className="text-gold" /> : <Sun size={18} className="text-gold" />}
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-white">{dark ? 'Dark mode' : 'Light mode'}</p>
                <p className="text-xs text-slate-400 dark:text-white/60">Applied instantly across the app</p>
              </div>
            </div>
            <Toggle checked={dark} onChange={toggle} label="Toggle theme" />
          </div>
        </SectionCard>

        <SectionCard
          icon={User}
          iconClass="bg-blue-500/10 text-blue-500"
          title="Outlook Integration"
          description="Connect your inbox to pull RFQ and order emails automatically"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <svg width="22" height="22" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <path d="M11.5 0V11.5V23L0 16.5V6.5L11.5 0Z" fill="#0078D4" />
                <path d="M11.5 0V11.5V23L23 16.5V6.5L11.5 0Z" fill="#106EBE" />
                <path d="M11.5 0L0 6.5L11.5 11.5L23 6.5L11.5 0Z" fill="#F3F3F3" />
                <path d="M11.5 11.5L0 6.5V16.5L11.5 11.5Z" fill="#E5E5E5" />
                <path d="M11.5 11.5L23 6.5V16.5L11.5 11.5Z" fill="#D4D4D4" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-white flex items-center gap-2">
                  {msStatus?.connected ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald" />
                      Connected
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/30" />
                      Not connected
                    </>
                  )}
                </p>
                <p className="text-xs text-slate-400 dark:text-white/60 truncate">
                  {msStatus?.connected ? msStatus.email : 'No Outlook account linked'}
                </p>
              </div>
            </div>

            {msStatus?.connected ? (
              <button
                onClick={handleDisconnectOutlook}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 text-sm font-medium transition-all duration-200 shrink-0"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnectOutlook}
                disabled={msLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-navy rounded-lg text-sm font-semibold hover:bg-gold-dark hover:shadow-gold active:scale-[0.98] transition-all duration-200 disabled:opacity-50 shrink-0"
              >
                {msLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                {msLoading ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>
        </SectionCard>

        <SectionCard icon={LogOut} iconClass="bg-danger/10 text-danger" title="Account" description="Sign out of the terminal">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400 dark:text-white/60">End your current session.</p>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 text-sm font-medium transition-all duration-200"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default Settings;

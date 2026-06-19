import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, microsoftLogin } from '../services/authService';
import { Eye, EyeOff, Loader2, KanbanSquare } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'success') {
      setTimeout(() => navigate('/home'), 500);
    }
    const loginError = urlParams.get('error');
    if (loginError) {
      setError(`Microsoft login failed: ${loginError}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login(formData.username, formData.password);
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/home');
    } catch (err) {
      setError(err.error || err.username || err.password || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setError('');
    setMicrosoftLoading(true);
    try {
      const response = await microsoftLogin();
      if (response.success && response.auth_url) {
        const width = 600;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        const popup = window.open(
          response.auth_url,
          'Microsoft Login',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );
        if (!popup) {
          setError('Popup blocked. Please allow popups for this site.');
          setMicrosoftLoading(false);
          return;
        }
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            setMicrosoftLoading(false);
          }
        }, 500);
      } else {
        setError('Failed to initiate Microsoft login');
        setMicrosoftLoading(false);
      }
    } catch (err) {
      setError(err.error || 'Microsoft login failed');
      setMicrosoftLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-ivory dark:bg-navy-dark">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10 bg-navy dark:bg-navy">
        <div className="flex items-center gap-3">
          <KanbanSquare size={20} className="text-gold" />
          <span className="text-lg font-bold text-white tracking-tight">
            Co.Ri.Metal
            <span className="text-[10px] font-mono ml-2 text-gold font-normal">Copilot</span>
          </span>
        </div>

        <div className="my-auto max-w-xl">
          <div className="w-16 h-0.5 bg-gold mb-8" />
          <h2 className="text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Trusted
            <br />
            <span className="text-gold">Metal Trading</span>
            <br />
            Intelligence
          </h2>
          <p className="text-base leading-relaxed text-white/60 max-w-lg">
            Connecting suppliers and clients with precision, transparency, and quiet confidence.
          </p>
        </div>

        <div className="border border-white/10 rounded-xl p-6 bg-white/5">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">System Status</span>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald dark:text-emerald">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
              Online
            </span>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-[9px] font-mono uppercase text-white/40 tracking-wider">RFQ Analyzed</p>
              <p className="text-xl font-bold text-white mt-1 font-mono">428,918</p>
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase text-white/40 tracking-wider">AI Confidence</p>
              <p className="text-xl font-bold text-gold mt-1 font-mono">99.84%</p>
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase text-white/40 tracking-wider">Avg. Response</p>
              <p className="text-xl font-bold text-white mt-1 font-mono">12.4s</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-700 dark:text-white mb-1">Sign In</h1>
            <p className="text-sm text-slate-400 dark:text-white/60">Enter your credentials</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">
                Username / Email
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/30 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all duration-200"
                placeholder="john@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-white/60">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/30 text-sm pr-12 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all duration-200"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/60 hover:text-slate-600 dark:hover:text-white transition-colors duration-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gold text-white font-semibold rounded-lg text-sm hover:bg-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Authorizing
                </>
              ) : (
                'Access Terminal'
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-light dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-3 bg-ivory dark:bg-navy-dark text-slate-400 dark:text-white/40 font-mono text-[10px]">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleMicrosoftLogin}
              disabled={microsoftLoading}
              className="w-full py-2.5 px-4 rounded-lg border-2 border-gold/50 text-slate-600 dark:text-white/80 hover:bg-gold/5 dark:hover:bg-gold/10 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {microsoftLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Connecting
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.5 0L0 6.5V16.5L11.5 23L23 16.5V6.5L11.5 0Z" fill="#F3F3F3" />
                    <path d="M11.5 0V11.5V23L0 16.5V6.5L11.5 0Z" fill="#E5E5E5" />
                    <path d="M11.5 0L0 6.5L11.5 11.5L23 6.5L11.5 0Z" fill="#F3F3F3" />
                    <path d="M11.5 11.5L0 6.5V16.5L11.5 11.5Z" fill="#E5E5E5" />
                    <path d="M11.5 11.5L23 6.5V16.5L11.5 11.5Z" fill="#D4D4D4" />
                    <path d="M11.5 0V11.5V23L0 16.5V6.5L11.5 0Z" fill="#0078D4" />
                    <path d="M11.5 0V11.5V23L23 16.5V6.5L11.5 0Z" fill="#106EBE" />
                  </svg>
                  Sign in with Microsoft
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

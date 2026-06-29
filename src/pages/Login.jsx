import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { Eye, EyeOff, Loader2, KanbanSquare } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

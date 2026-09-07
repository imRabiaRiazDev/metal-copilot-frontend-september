import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import createAuthManager from '../services/authManager';
import { logout, getToken } from '../services/authService';
import useTheme from '../hooks/useTheme';

const authManager = createAuthManager();

const Layout = ({ children }) => {
  const navigate = useNavigate();
  useTheme();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar') === 'collapsed',
  );

  useEffect(() => {
    const token = getToken();
    authManager.start(token, {
      onExpired: () => {
        logout();
        navigate('/login', { replace: true });
      },
    });
    return () => authManager.stop();
  }, [navigate]);

  const handleToggle = () => {
    setCollapsed((prev) => {
      localStorage.setItem('sidebar', prev ? 'expanded' : 'collapsed');
      return !prev;
    });
  };

  return (
    <div className="flex min-h-screen bg-ivory dark:bg-navy-dark">
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />
      <main
        className={`flex-1 min-w-0 relative z-10 animate-fadeInUp transition-[margin] duration-300 ${
          collapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <div className="p-6 lg:p-8">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default Layout;

import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import createAuthManager from '../services/authManager';
import { logout, getToken } from '../services/authService';

const authManager = createAuthManager();

const Layout = ({ children }) => {
  const navigate = useNavigate();

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

  return (
    <div className="flex min-h-screen bg-ivory dark:bg-navy-dark">
      <Sidebar />
      <main className="flex-1 ml-64 relative z-10 animate-fadeInUp">
        <div className="p-8">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default Layout;

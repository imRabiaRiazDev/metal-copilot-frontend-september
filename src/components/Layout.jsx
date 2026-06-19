import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-ivory dark:bg-navy-dark">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen relative z-10 animate-fadeInUp">
        <div className="p-8">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default Layout;

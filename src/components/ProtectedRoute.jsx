/**
 * Protected Route Component
 * Redirects to login page if user is not authenticated
 * Allows access to children if user is authenticated
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

const ProtectedRoute = () => {
  // Check if user is authenticated
  const isAuth = isAuthenticated();

  // If not authenticated, redirect to login page
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;

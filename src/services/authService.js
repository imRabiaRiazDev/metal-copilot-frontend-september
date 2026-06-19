/**
 * Authentication Service
 * Handles all API calls related to authentication
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/auth';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Login function
 * @param {string} username - Email or username
 * @param {string} password - User password
 * @returns {Promise} - Response with access and refresh tokens
 */
export const login = async (username, password) => {
  try {
    const response = await api.post('/login/', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Login failed' };
  }
};

/**
 * Get protected data
 * @param {string} token - JWT access token
 * @returns {Promise} - Response with protected data
 */
export const getProtectedData = async (token) => {
  try {
    const response = await api.get('/protected/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch protected data' };
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if token exists in localStorage
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  return !!token;
};

/**
 * Get the access token from localStorage
 * @returns {string|null} - Access token or null
 */
export const getToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * Logout function
 * Removes tokens from localStorage
 */
export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

/**
 * Microsoft OAuth2 Login
 * Initiates Microsoft login flow
 * @returns {Promise} - Response with authorization URL
 */
export const microsoftLogin = async () => {
  try {
    const response = await api.get('/microsoft/login/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Microsoft login failed' };
  }
};

/**
 * Refresh Microsoft token
 * @returns {Promise} - Response with new access token
 */
export const refreshMicrosoftToken = async () => {
  try {
    const token = getToken();
    const response = await api.post('/microsoft/refresh/', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Token refresh failed' };
  }
};

/**
 * Disconnect Microsoft account
 * @returns {Promise} - Response confirming disconnection
 */
export const disconnectMicrosoft = async () => {
  try {
    const token = getToken();
    const response = await api.post('/microsoft/disconnect/', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Disconnect failed' };
  }
};

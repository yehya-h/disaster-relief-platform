import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        // Verify token with backend
        const response = await authAPI.verifyToken();
        if (response.data.valid && response.data.user) {
          setIsAuthenticated(true);
          setAdmin(response.data.user);
        } else {
          // Invalid token, clear storage
          localStorage.removeItem('adminToken');
          setIsAuthenticated(false);
          setAdmin(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Token verification failed, clear storage
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.data.token && response.data.user) {
        // Store token
        localStorage.setItem('adminToken', response.data.token);
        
        // Set authentication state
        setIsAuthenticated(true);
        setAdmin(response.data.user);
        
        return { success: true };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      // Handle different error scenarios
      let errorMessage = 'Login failed';
      if (error.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint (optional for JWT)
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local state and storage
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
      setAdmin(null);
    }
    return { success: true };
  };

  const value = {
    isAuthenticated,
    admin,
    loading,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
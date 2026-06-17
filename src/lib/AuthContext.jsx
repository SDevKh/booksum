import React, { createContext, useContext, useEffect, useState } from 'react';
import { baseClient } from '@/api/baseClient';

const AuthContext = createContext();
const STORAGE_KEY = 'bookwise_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const savedUser = window.localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
    setIsLoadingAuth(false);
  }, []);

  const login = async (username, password) => {
    setAuthError(null);
    try {
      const response = await baseClient.post('/api/auth/login', { username, password });
      if (response && response.success && response.user) {
        const loggedUser = response.user;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser));
        setUser(loggedUser);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err.message || 'Invalid username or password';
      setAuthError({ type: 'auth_failed', message: errMsg });
      throw new Error(errMsg);
    }
  };

  const signup = async (username, password) => {
    setAuthError(null);
    try {
      const response = await baseClient.post('/api/auth/signup', { username, password });
      if (response && response.success && response.user) {
        // Auto-login upon successful signup
        const loggedUser = response.user;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser));
        setUser(loggedUser);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        throw new Error(response.error || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      const errMsg = err.message || 'Failed to create account. Username might be taken.';
      setAuthError({ type: 'auth_failed', message: errMsg });
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  };

  const navigateToLogin = () => {
    setAuthError({ type: 'auth_required', message: 'Please sign in to continue.' });
  };

  const checkUserAuth = async () => user;
  const checkAppState = async () => null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings: false,
        authError,
        appPublicSettings: { public_settings: { auth_required: true } },
        authChecked: true,
        login,
        signup,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

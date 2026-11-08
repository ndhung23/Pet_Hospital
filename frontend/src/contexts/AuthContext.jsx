import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const getRoleDashboardRoute = (role) => {
  switch (role) {
    case 'PET_OWNER':
      return '/portal';
    case 'RECEPTIONIST':
      return '/reception';
    case 'VETERINARIAN':
      return '/vet';
    case 'NURSE':
      return '/lab';
    case 'CLINIC_MANAGER':
      return '/manager';
    default:
      return '/login';
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on application mount
  const checkAuthStatus = useCallback(async () => {
    try {
      const data = await authService.refresh();
      if (data?.user) {
        setUser(data.user);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (identifier, password) => {
    const data = await authService.login({ identifier, password });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

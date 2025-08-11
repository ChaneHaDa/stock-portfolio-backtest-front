"use client";
import { useState, useEffect, useCallback } from 'react';

interface UseAuthReturn {
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const checkAuth = useCallback(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      setIsAuthenticated(!!token);
      setAccessToken(token);
    }
  }, []);

  const login = useCallback((token: string) => {
    localStorage.setItem('accessToken', token);
    setAccessToken(token);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    accessToken,
    login,
    logout,
    checkAuth,
  };
};
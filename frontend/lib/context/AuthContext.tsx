// AuthContext provider

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, LoginCredentials, UserCreate, UserUpdate, PasswordChange, AuthContextType } from '@/types/auth';
import * as authApi from '@/lib/api/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await authApi.getMe();
          setUser(userData);
        } catch (error) {
          // Token invalid or expired
          localStorage.removeItem('access_token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const tokenData = await authApi.login(credentials);
      localStorage.setItem('access_token', tokenData.access_token);
      setToken(tokenData.access_token);
      
      const userData = await authApi.getMe();
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: UserCreate) => {
    setIsLoading(true);
    try {
      await authApi.register(data);
      // After registration, auto-login
      await login({ username: data.email, password: data.password });
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (token) {
      try {
        const userData = await authApi.getMe();
        setUser(userData);
      } catch (error) {
        logout();
      }
    }
  }, [token, logout]);

  const updateProfile = useCallback(async (data: UserUpdate) => {
    const updatedUser = await authApi.updateMe(data);
    setUser(updatedUser);
  }, []);

  const changePassword = useCallback(async (data: PasswordChange) => {
    await authApi.changePassword(data);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

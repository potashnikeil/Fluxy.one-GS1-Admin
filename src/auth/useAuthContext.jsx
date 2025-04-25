import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, getToken, logout as apiLogout, checkAuth } from './authService';
import axios from 'axios';

const AuthContext = createContext(null);

const axiosInstance = axios.create();

// Глобальный перехватчик для всех запросов
axiosInstance.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { isAuthenticated, user: authUser } = await checkAuth();
        
        if (isAuthenticated && authUser) {
          setUser(authUser);
          setToken(getToken());
        } else {
          console.log('Авторизация не подтверждена');
          apiLogout();
        }
      } catch (error) {
        console.error('Ошибка при инициализации авторизации:', error);
        apiLogout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const value = { 
    user, 
    token, 
    isAuthenticated: !!token && !!user, 
    login,
    logout, 
    setUser,
    isLoading 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};
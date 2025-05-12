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
  const [token, setToken] = useState(getToken());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { isAuthenticated, user: authUser } = await checkAuth();
        
        if (isAuthenticated && authUser) {
          setUser(authUser);
          const storedToken = getToken();
          if (storedToken) {
            setToken(storedToken);
          } else {
            console.log('Токен отсутствует при наличии пользователя');
            await apiLogout();
          }
        } else {
          console.log('Авторизация не подтверждена');
          await apiLogout();
        }
      } catch (error) {
        console.error('Ошибка при инициализации авторизации:', error);
        setError(error.message);
        await apiLogout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (userData, authToken) => {
    if (!userData || !authToken) {
      console.error('Отсутствуют данные для входа:', { userData, authToken });
      setError('Отсутствуют данные для входа');
      return;
    }
    
    try {
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setToken(authToken);
      setError(null);
    } catch (error) {
      console.error('Ошибка при сохранении данных авторизации:', error);
      setError('Ошибка при сохранении данных авторизации');
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    setUser(null);
    setToken(null);
      setError(null);
    }
  };

  const value = { 
    user, 
    token,
    isLoading,
    error,
    login, 
    logout,
    isAuthenticated: !!user && !!token
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
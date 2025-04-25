import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const PrivateRoute = ({ adminOnly = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Если не авторизован, редиректим на страницу логина
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Если доступ только для админа, проверяем роль
  if (adminOnly && user?.role !== 'admin') {
    console.log('Доступ запрещен: требуется роль admin, текущая роль:', user?.role);
    return <Navigate to="/products" replace />;
  }

  // Рендерим layout с сайдбаром и хедером
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <Outlet />
      </div>
    </div>
  );
};

export default PrivateRoute;
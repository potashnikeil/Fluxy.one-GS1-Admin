import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Stats from './pages/Stats';
import Profile from './pages/Profile';

// Страницы для администратора
import AdminCompanies from './pages/admin/Companies';
import AdminUsers from './pages/admin/Users';
import AdminProducts from './pages/admin/Products';
import AdminImports from './pages/admin/Imports';
import AdminReports from './pages/admin/Reports';

import CSVUpload from './components/CSVUpload';
import Login from './pages/Login';

import { AuthProvider, useAuth } from './auth/useAuthContext';
import PrivateRoute from './auth/PrivateRoute';

// Компонент для проверки авторизации
const AuthCheck = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && location.pathname !== '/login') {
        navigate('/login', { replace: true });
      } else if (isAuthenticated && location.pathname === '/login') {
        // Редирект в зависимости от роли
        const redirectPath = user?.role === 'admin' ? '/admin/companies' : '/products';
        navigate(redirectPath, { replace: true });
      }
    }
  }, [isAuthenticated, location.pathname, navigate, isLoading, user?.role]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthCheck>
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/login" element={<Login />} />
            
            {/* Защищенные маршруты */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Navigate to="/products" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/upload" element={<CSVUpload />} />
            </Route>

            {/* Админские маршруты */}
            <Route path="/admin" element={<PrivateRoute adminOnly />}>
              <Route index element={<Navigate to="companies" replace />} />
              <Route path="companies" element={<AdminCompanies />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="imports" element={<AdminImports />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>
          </Routes>
        </AuthCheck>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
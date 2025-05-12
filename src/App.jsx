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
import ProductDetails from './pages/admin/ProductDetails';

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

// Компонент для отображения защищенного контента с сайдбаром
const ProtectedLayout = ({ children }) => {
  return (
    <div className="main-container">
      <Sidebar />
      <div className="content-with-sidebar">
        {children}
      </div>
    </div>
  );
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
              <Route path="/" element={
                <ProtectedLayout>
                  <Navigate to="/products" replace />
                </ProtectedLayout>
              } />
              <Route path="/dashboard" element={
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              } />
              <Route path="/products" element={
                <ProtectedLayout>
                  <Products />
                </ProtectedLayout>
              } />
              <Route path="/stats" element={
                <ProtectedLayout>
                  <Stats />
                </ProtectedLayout>
              } />
              <Route path="/profile" element={
                <ProtectedLayout>
                  <Profile />
                </ProtectedLayout>
              } />
              <Route path="/upload" element={
                <ProtectedLayout>
                  <CSVUpload />
                </ProtectedLayout>
              } />
            </Route>

            {/* Админские маршруты */}
            <Route path="/admin" element={<PrivateRoute adminOnly />}>
              <Route index element={
                <ProtectedLayout>
                  <Navigate to="/admin/companies" replace />
                </ProtectedLayout>
              } />
              <Route path="companies" element={
                <ProtectedLayout>
                  <AdminCompanies />
                </ProtectedLayout>
              } />
              <Route path="users" element={
                <ProtectedLayout>
                  <AdminUsers />
                </ProtectedLayout>
              } />
              <Route path="products" element={
                <ProtectedLayout>
                  <AdminProducts />
                </ProtectedLayout>
              } />
              <Route path="products/:gtin" element={
                <ProtectedLayout>
                  <ProductDetails />
                </ProtectedLayout>
              } />
              <Route path="imports" element={
                <ProtectedLayout>
                  <AdminImports />
                </ProtectedLayout>
              } />
              <Route path="reports" element={
                <ProtectedLayout>
                  <AdminReports />
                </ProtectedLayout>
              } />
            </Route>
              </Routes>
        </AuthCheck>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
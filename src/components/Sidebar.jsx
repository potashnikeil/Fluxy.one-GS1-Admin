import React from "react";
import { useAuth } from "../auth/useAuthContext";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-header">
          <h2 className="text-xl font-bold">Fluxy DPP</h2>
        </div>
        <nav className="sidebar-menu">
          {/* Ссылка на профиль доступна всем */}
          <Link 
            to="/profile" 
            className={`sidebar-menu-item ${location.pathname === '/profile' ? 'active' : ''}`}
          >
            Profile
          </Link>

          {/* Ссылки для пользователей с ролью user */}
          {user?.role === 'user' && (
            <>
              <Link 
                to="/dashboard" 
                className={`sidebar-menu-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/products" 
                className={`sidebar-menu-item ${location.pathname === '/products' ? 'active' : ''}`}
              >
                Products
              </Link>
              <Link 
                to="/stats" 
                className={`sidebar-menu-item ${location.pathname === '/stats' ? 'active' : ''}`}
              >
                Stats
              </Link>
            </>
          )}

          {/* Ссылки только для админов */}
          {user?.role === 'admin' && (
            <>
              <Link 
                to="/admin/companies" 
                className={`sidebar-menu-item ${location.pathname === '/admin/companies' ? 'active' : ''}`}
              >
                Компании
              </Link>
              <Link 
                to="/admin/users" 
                className={`sidebar-menu-item ${location.pathname === '/admin/users' ? 'active' : ''}`}
              >
                Пользователи
              </Link>
              <Link 
                to="/admin/products" 
                className={`sidebar-menu-item ${location.pathname === '/admin/products' ? 'active' : ''}`}
              >
                Все продукты
              </Link>
              <Link 
                to="/admin/imports" 
                className={`sidebar-menu-item ${location.pathname === '/admin/imports' ? 'active' : ''}`}
              >
                Imports
              </Link>
              <Link 
                to="/admin/reports" 
                className={`sidebar-menu-item ${location.pathname === '/admin/reports' ? 'active' : ''}`}
              >
                Reports
              </Link>
            </>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

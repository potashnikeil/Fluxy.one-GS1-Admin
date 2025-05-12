import React from "react";
import { useAuth } from "../auth/useAuthContext"; // Импортируем useAuth
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, logout } = useAuth(); // Получаем текущего пользователя
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Fluxy Admin Panel</h1>
      <div className="flex items-center gap-4">
      {/* Отображаем имя и роль пользователя */}
        <div className="text-gray-600">{user ? `${user.email} (${user.role})` : "Guest"}</div>
        {user && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;

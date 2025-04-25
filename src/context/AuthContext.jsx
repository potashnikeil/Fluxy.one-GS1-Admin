import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Здесь хранится информация о пользователе
  const navigate = useNavigate();

  const login = (userData) => {
    setUser(userData);
    navigate(userData.role === 'admin' ? '/admin/companies' : '/dashboard'); // Перенаправление в зависимости от роли
  };

  const logout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// src/hooks/useAuth.js
import { useState, useEffect } from "react";

// Пример простого хука авторизации
export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Здесь можно добавить логику для загрузки данных о пользователе
    const loggedInUser = { name: "John Doe", role: "admin" }; // Пример пользователя
    setUser(loggedInUser); // Устанавливаем пользователя
  }, []);

  return { user }; // Возвращаем объект с user
};

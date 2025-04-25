import React from "react";
import { useAuth } from "../auth/useAuthContext";  // Импортируем useAuth

const Sidebar = () => {
  const { user } = useAuth();  // Получаем текущего пользователя

  return (
    <aside className="w-64 bg-gray-800 text-white h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Fluxy DPP</h2>
      <nav className="space-y-2">
        {/* Ссылка на профиль доступна всем */}
        <a href="/profile" className="block hover:underline">Profile</a>

        {/* Ссылки для пользователей с ролью user */}
        {user?.role === 'user' && (
          <>
            <a href="/dashboard" className="block hover:underline">Dashboard</a>
            <a href="/products" className="block hover:underline">Products</a>
            <a href="/stats" className="block hover:underline">Stats</a>
          </>
        )}

        {/* Ссылки только для админов */}
        {user?.role === 'admin' && (
          <>
            <a href="/admin/companies" className="block hover:underline">Companies</a>
            <a href="/admin/users" className="block hover:underline">Users</a>
            <a href="/admin/products" className="block hover:underline">Admin Products</a>
            <a href="/admin/imports" className="block hover:underline">Imports</a>
            <a href="/admin/reports" className="block hover:underline">Reports</a>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;

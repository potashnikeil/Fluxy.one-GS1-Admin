import React from 'react';

export default function Dashboard() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">Статистика по продуктам</div>
        <div className="bg-white p-4 rounded shadow">Статистика по пользователям</div>
        <div className="bg-white p-4 rounded shadow">График активности</div>
      </div>
    </div>
  );
}
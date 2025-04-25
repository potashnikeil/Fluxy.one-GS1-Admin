import React from 'react';

export default function Companies() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Компании</h1>
      <button className="mb-4 bg-green-500 text-white px-4 py-2 rounded">Добавить компанию</button>
      <div className="bg-white p-4 rounded shadow">Таблица компаний</div>
    </div>
  );
}
import React from 'react';

export default function Products() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Продукты</h1>
      <input type="text" placeholder="Поиск..." className="mb-4 p-2 border rounded w-full" />
      <div className="bg-white p-4 rounded shadow">
        Таблица продуктов (название, GTIN, категория, действия)
      </div>
    </div>
  );
}
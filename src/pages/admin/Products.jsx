import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../../auth/authService'; // Путь к authService

const Products = () => {
  const [products, setProducts] = useState([]); // Хранение данных о продуктах
  const [filter, setFilter] = useState(''); // Фильтрация по имени продукта

  useEffect(() => {
    // Функция для загрузки данных с сервера
    const fetchProducts = async () => {
      try {
        const token = getToken(); // Получаем токен из localStorage
        const response = await axios.get('/api/products', {
          headers: {
            'Authorization': `Bearer ${token}` // Отправляем токен для авторизации
          }
        });
        const data = response.data;
        
        // Убедимся, что данные — это массив
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error('Полученные данные не являются массивом:', data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error);
      }
    };

    fetchProducts();
  }, []);

  // Фильтрация продуктов по имени
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Продукты</h1>
      
      {/* Поле для фильтрации */}
      <input
        type="text"
        placeholder="Поиск по названию..."
        className="mb-4 p-2 border rounded w-full"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      
      {/* Таблица продуктов */}
      <div className="overflow-x-auto bg-white p-4 rounded shadow">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Название</th>
              <th className="px-4 py-2">GTIN</th>
              <th className="px-4 py-2">Категория</th>
              <th className="px-4 py-2">Статус</th>
              <th className="px-4 py-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-2">{product.name}</td>
                <td className="px-4 py-2">{product.gtin}</td>
                <td className="px-4 py-2">{product.category}</td>
                <td className="px-4 py-2">{product.status}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => alert(`Просмотр ${product.name}`)}
                    className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600"
                  >
                    Просмотреть
                  </button>
                  <button
                    onClick={() => alert(`Открыть публичную ссылку для ${product.name}`)}
                    className="bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600 ml-2"
                  >
                    Открыть публичную ссылку
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
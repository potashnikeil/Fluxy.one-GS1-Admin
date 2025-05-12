import axios from 'axios';
import { getToken } from '../auth/authService';

const API_URL = 'http://localhost:5000/api';

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем перехватчик для установки токена
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Ошибка в интерцепторе запроса:', error);
    return Promise.reject(error);
  }
);

// Добавляем перехватчик для обработки ответов
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Ошибка авторизации при запросе к API');
    }
    return Promise.reject(error);
  }
);

// Получение списка продуктов
export const getProducts = async () => {
  try {
    const response = await api.get('/products/short');
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Обработка ошибки авторизации
      throw new Error('Требуется авторизация');
    }
    throw error;
  }
};

// Получение детальной информации о продукте
export const getProductDetails = async (gtin) => {
  console.log('Calling getProductDetails for GTIN:', gtin);
  const token = getToken();
  console.log('Token from getToken:', token);
  
  try {
    const response = await api.get(`/products/${gtin}`);
    console.log('Product details response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    
    if (error.response?.status === 401) {
      throw new Error('Требуется авторизация');
    } else if (error.response?.status === 404) {
      throw new Error('Продукт не найден');
    } else if (error.response?.status === 500) {
      const errorMessage = error.response?.data?.message || 'Ошибка сервера при получении данных продукта';
      console.error('Ошибка сервера:', errorMessage);
      throw new Error(errorMessage);
    }
    
    throw new Error('Не удалось загрузить информацию о продукте');
  }
};

// Получение всех продуктов (для админа)
export const getAllProducts = async () => {
  try {
    console.log('Запрос всех продуктов...');
    const token = getToken();
    console.log('Токен для запроса:', token ? 'присутствует' : 'отсутствует');
    
    const response = await api.get('/products/all');
    console.log('Получены продукты:', response.data);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.error('Некорректный формат данных:', response.data);
      throw new Error('Некорректный формат данных от сервера');
    }
    
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении продуктов:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      throw new Error('Требуется авторизация');
    } else if (error.response?.status === 403) {
      throw new Error('Доступ запрещен');
    } else if (error.response?.status === 404) {
      throw new Error('Продукты не найдены');
    }
    
    throw error;
  }
};

// Создание нового продукта
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании продукта:', error.response?.data || error.message);
    throw error;
  }
};

// Обновление продукта
export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении продукта:', error.response?.data || error.message);
    throw error;
  }
};

// Удаление продукта
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при удалении продукта:', error.response?.data || error.message);
    throw error;
  }
}; 
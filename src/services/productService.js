import axios from 'axios';
import { getToken } from '../auth/authService';

const API_URL = 'http://localhost:5000/api';

// Создаем инстанс axios с базовыми настройками
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем интерцептор для авторизации
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Request config:', {
    url: config.url,
    method: config.method,
    headers: config.headers
  });
  return config;
});

// Добавляем интерцептор для ответов
api.interceptors.response.use(
  (response) => {
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
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
  try {
    const response = await api.get(`/products/${gtin}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Требуется авторизация');
    } else if (error.response?.status === 404) {
      throw new Error('Нет доступа к этому продукту');
    }
    throw error;
  }
};

// Получение всех продуктов (для админа)
export const getAllProducts = async () => {
  try {
    console.log('Calling getAllProducts');
    const token = getToken();
    console.log('Token from getToken:', token);
    
    const response = await api.get('/products/all');
    console.log('getAllProducts полный ответ:', response);
    console.log('getAllProducts данные:', response.data);
    console.log('getAllProducts структура данных:', {
      isArray: Array.isArray(response.data),
      length: response.data?.length,
      fields: response.data?.[0] ? Object.keys(response.data[0]) : []
    });
    return response.data;
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    if (error.response?.status === 401) {
      throw new Error('Требуется авторизация');
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
    if (error.response?.status === 401) {
      throw new Error('Требуется авторизация');
    }
    throw error;
  }
};

// Обновление продукта
export const updateProduct = async (gtin, productData) => {
  try {
    const response = await api.put(`/products/${gtin}`, productData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Требуется авторизация');
    } else if (error.response?.status === 404) {
      throw new Error('Продукт не найден');
    }
    throw error;
  }
};

// Удаление продукта
export const deleteProduct = async (gtin) => {
  try {
    const response = await api.delete(`/products/${gtin}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Требуется авторизация');
    } else if (error.response?.status === 404) {
      throw new Error('Продукт не найден');
    }
    throw error;
  }
}; 
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем перехватчик для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const checkAuth = async () => {
  try {
    console.log('Проверка авторизации...');
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('Токен отсутствует в localStorage');
      return { isAuthenticated: false };
    }

    const response = await api.get('/check');
    console.log('Ответ проверки авторизации:', response.data);
    
    if (response.data?.user) {
      return { isAuthenticated: true, user: response.data.user };
    }
    
    return { isAuthenticated: false };
  } catch (error) {
    console.error('Ошибка при проверке авторизации:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return { isAuthenticated: false };
  }
};

export const login = async (email, password) => {
  try {
    console.log('Отправка запроса на авторизацию:', { email });
    
    const response = await api.post('/login', { email, password });
    console.log('Полный ответ сервера:', JSON.stringify(response.data, null, 2));
    
    // Проверяем наличие данных в ответе
    if (!response.data) {
      console.error('Пустой ответ от сервера');
      return { 
        success: false, 
        message: 'Пустой ответ от сервера' 
      };
    }

    const { token, user } = response.data;

    // Подробная проверка формата ответа
    if (!token) {
      console.error('Отсутствует токен в ответе:', response.data);
      return { 
        success: false, 
        message: 'Отсутствует токен доступа в ответе сервера' 
      };
    }

    if (!user) {
      console.error('Отсутствуют данные пользователя в ответе:', response.data);
      return { 
        success: false, 
        message: 'Отсутствуют данные пользователя в ответе сервера' 
      };
    }

    // Проверяем обязательные поля пользователя
    const requiredFields = ['id', 'email', 'role'];
    const missingFields = requiredFields.filter(field => !user[field]);
    
    if (missingFields.length > 0) {
      console.error('Отсутствуют обязательные поля пользователя:', missingFields);
      return {
        success: false,
        message: `Неполные данные пользователя: отсутствуют ${missingFields.join(', ')}`
      };
    }

    console.log('Данные пользователя прошли валидацию, сохраняем в localStorage');
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return { success: true, user, token };
  } catch (error) {
    console.error('Ошибка при авторизации:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'Ошибка входа'
    };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    return null;
  }
};

export const getToken = () => {
  return localStorage.getItem('token');
};
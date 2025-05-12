import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
    const token = getToken();
    if (!token) {
      return { isAuthenticated: false };
    }

    const response = await axios.get(`${API_URL}/auth/check`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return { 
      isAuthenticated: true, 
      user: response.data.user 
    };
  } catch (error) {
    console.error('Ошибка при проверке авторизации:', error.response?.data || error.message);
    return { isAuthenticated: false };
  }
};

export const login = async (email, password) => {
  try {
    console.log('Попытка входа:', { email });
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    
    if (response.data.message) {
      return { success: false, message: response.data.message };
    }

    const { token, user } = response.data;
  
    if (!token || !user) {
      return { 
        success: false, 
        message: 'Отсутствует токен или данные пользователя в ответе' 
      };
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return { success: true, token, user };
  } catch (error) {
    console.error('Ошибка при входе:', error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Ошибка при входе в систему'
    };
  }
};

export const logout = async () => {
  try {
    const token = getToken();
    if (token) {
      await axios.post(`${API_URL}/auth/logout`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  } catch (error) {
    console.error('Ошибка при выходе:', error.response?.data || error.message);
  }
};

export const getToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Токен не найден в localStorage');
      return null;
    }
    return token;
  } catch (error) {
    console.error('Ошибка при получении токена:', error);
    return null;
  }
};

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    return null;
  }
};
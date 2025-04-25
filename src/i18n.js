// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: 'en', // Язык по умолчанию
  fallbackLng: 'en', // Язык по умолчанию, если текущий не поддерживается
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

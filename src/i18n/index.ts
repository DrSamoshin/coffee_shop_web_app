import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { logger } from '../services/logger';

// Import translation files
import enTranslations from './locales/en.json';
import ruTranslations from './locales/ru.json';

const resources = {
  en: {
    translation: enTranslations
  },
  ru: {
    translation: ruTranslations
  }
};

const savedLanguage = localStorage.getItem('language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    react: {
      useSuspense: false
    }
  });

// Log language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  logger.userAction('language_changed', 'App', { language: lng });
});

logger.info('i18n', `Initialized with language: ${savedLanguage}`);

export default i18n; 
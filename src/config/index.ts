import { APP_CONFIG } from './constants';
import ENV_CONFIG from './env.template';

// Configuration interface
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  app: {
    name: string;
    subtitle: string;
    version: string;
    defaultLanguage: string;
    availableLanguages: readonly string[];
  };
  logging: {
    maxLogs: number;
    defaultLevel: string;
    consoleEnabled: boolean;
  };
  ui: {
    animationDuration: number;
    toastDuration: number;
    debounceDelay: number;
    colors: typeof APP_CONFIG.UI.COLORS;
    breakpoints: typeof APP_CONFIG.UI.BREAKPOINTS;
  };
  storage: {
    keys: typeof APP_CONFIG.STORAGE_KEYS;
  };
  business: typeof APP_CONFIG.BUSINESS;
}

// Default API configuration
const getApiConfig = () => {
  // Логика выбора baseUrl:
  // VITE_USE_API_PROXY=true - используем прокси /api (для разработки/preview)
  // VITE_USE_API_PROXY=false - используем прямой URL (для продакшн деплоя)
  const baseUrl = ENV_CONFIG.USE_API_PROXY ? '/api' : ENV_CONFIG.API_BASE_URL;
  
  // Debug info
  console.log('API Config Debug:', {
    USE_API_PROXY: ENV_CONFIG.USE_API_PROXY,
    API_BASE_URL: ENV_CONFIG.API_BASE_URL,
    finalBaseUrl: baseUrl,
    mode: ENV_CONFIG.MODE,
    dev: ENV_CONFIG.IS_DEVELOPMENT
  });
  
  return {
    baseUrl,
    timeout: APP_CONFIG.API.TIMEOUT,
    retryAttempts: APP_CONFIG.API.RETRY_ATTEMPTS,
    retryDelay: APP_CONFIG.API.RETRY_DELAY,
  };
};

// Main application configuration
export const config: AppConfig = {
  api: getApiConfig(),
  app: {
    name: APP_CONFIG.NAME,
    subtitle: APP_CONFIG.SUBTITLE,
    version: APP_CONFIG.VERSION,
    defaultLanguage: APP_CONFIG.DEFAULT_LANGUAGE,
    availableLanguages: APP_CONFIG.AVAILABLE_LANGUAGES,
  },
  logging: {
    maxLogs: APP_CONFIG.LOGGING.MAX_LOGS,
    defaultLevel: APP_CONFIG.LOGGING.DEFAULT_LEVEL,
    consoleEnabled: APP_CONFIG.LOGGING.CONSOLE_ENABLED,
  },
  ui: {
    animationDuration: APP_CONFIG.UI.ANIMATION_DURATION,
    toastDuration: APP_CONFIG.UI.TOAST_DURATION,
    debounceDelay: APP_CONFIG.UI.DEBOUNCE_DELAY,
    colors: APP_CONFIG.UI.COLORS,
    breakpoints: APP_CONFIG.UI.BREAKPOINTS,
  },
  storage: {
    keys: APP_CONFIG.STORAGE_KEYS,
  },
  business: APP_CONFIG.BUSINESS,
};

// Export for easy access
export default config;

// Export individual configs for convenience
export const apiConfig = config.api;
export const appConfig = config.app;
export const loggingConfig = config.logging;
export const uiConfig = config.ui;
export const storageConfig = config.storage;
export const businessConfig = config.business;

// Helper functions
export const getStorageKey = (key: keyof typeof APP_CONFIG.STORAGE_KEYS): string => {
  return APP_CONFIG.STORAGE_KEYS[key];
};

export const getApiEndpoint = (endpoint: string): string => {
  const baseUrl = config.api.baseUrl;
  return endpoint.startsWith('/') ? `${baseUrl}${endpoint}` : `${baseUrl}/${endpoint}`;
};

export const isDev = ENV_CONFIG.IS_DEVELOPMENT;
export const getEnvMode = () => ENV_CONFIG.MODE;
export const isAdminMode = () => ENV_CONFIG.ADMIN_MODE; 
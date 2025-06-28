import colorsConfig from './colors.json';
import ENV_CONFIG from './env.template';

// Application constants
export const APP_CONFIG = {
  // Application info (from environment variables)
  NAME: ENV_CONFIG.APP_NAME,
  SUBTITLE: ENV_CONFIG.APP_SUBTITLE,
  VERSION: '1.0.0',
  
  // UI Constants
  DEFAULT_LANGUAGE: ENV_CONFIG.DEFAULT_LANGUAGE,
  AVAILABLE_LANGUAGES: ['en', 'ru'],
  
  // Local Storage Keys
  STORAGE_KEYS: {
    TOKEN: 'coffee_shop_token',
    LANGUAGE: 'coffee_shop_language',
    USER_PREFERENCES: 'coffee_shop_preferences',
  },
  
  // API Configuration
  API: {
    TIMEOUT: ENV_CONFIG.API_TIMEOUT,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },
  
  // Logging Configuration
  LOGGING: {
    MAX_LOGS: 1000,
    DEFAULT_LEVEL: 'INFO',
    CONSOLE_ENABLED: ENV_CONFIG.ENABLE_LOGGING,
  },
  
  // UI Configuration
  UI: {
    ANIMATION_DURATION: ENV_CONFIG.ANIMATION_ENABLED ? 300 : 0,
    TOAST_DURATION: 4000,
    DEBOUNCE_DELAY: 300,
    
    // Colors from separate JSON file
    COLORS: colorsConfig,
    
    // Breakpoints
    BREAKPOINTS: {
      XS: 0,
      SM: 600,
      MD: 960,
      LG: 1280,
      XL: 1920,
    },
  },
  
  // Business logic constants
  BUSINESS: {
    CURRENCY: ENV_CONFIG.CURRENCY,
    PAGINATION_SIZE: 20,
  },
  
  // Feature flags
  FEATURES: {
    ADMIN_MODE: ENV_CONFIG.ADMIN_MODE,
    DEBUG_MODE: ENV_CONFIG.DEBUG_MODE,
    ANALYTICS: ENV_CONFIG.ENABLE_ANALYTICS,
    EXPERIMENTAL: ENV_CONFIG.ENABLE_EXPERIMENTAL_FEATURES,
  },
} as const;

// Export individual constants for convenience
export const {
  STORAGE_KEYS,
  API,
  LOGGING,
  UI,
  BUSINESS,
  FEATURES,
} = APP_CONFIG;

// Theme utilities
export const getAppBackground = (): string => {
  return APP_CONFIG.UI.COLORS.background.default;
};

export const getCardBackground = (): string => {
  return APP_CONFIG.UI.COLORS.background.card;
};

export const getCardHoverBackground = (): string => {
  return APP_CONFIG.UI.COLORS.background.cardHover;
}; 
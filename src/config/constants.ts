import colorsConfig from './colors.json';
import ENV_CONFIG from './env.template';

// Application constants
export const APP_CONFIG = {
  // Application info (from environment variables)
  NAME: ENV_CONFIG.APP_NAME,
  SUBTITLE: ENV_CONFIG.APP_SUBTITLE,
  VERSION: '1.0.0',
  
  // UI Constants
  DEFAULT_LANGUAGE: 'en',
  AVAILABLE_LANGUAGES: ['en', 'ru', 'es'],
  
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
    
    // Размеры и отступы
    SIZES: {
      // Изображения
      IMAGE_PREVIEW: {
        SMALL: { width: '100px', height: '100px' },
        MEDIUM: { width: '200px', height: '200px' },
        LARGE: { width: '400px', height: '400px' },
      },
      
      // Границы и скругления
      BORDER: {
        RADIUS: {
          SMALL: '4px',
          MEDIUM: '8px',
          LARGE: '12px',
        },
        WIDTH: {
          THIN: '1px',
          MEDIUM: '2px',
          THICK: '3px',
        }
      },
      
      // Типографика
      FONT: {
        SMALL: '12px',
        MEDIUM: '14px',
        LARGE: '16px',
        XLARGE: '18px',
        // Веса шрифтов
        WEIGHTS: {
          NORMAL: '400',
          MEDIUM: '500',
          SEMIBOLD: '600',
          BOLD: '700',
        },
      },
      
      // Отступы
      SPACING: {
        XS: '4px',
        SM: '8px',
        MD: '16px',
        LG: '24px',
        XL: '32px',
      },
      
      // Максимальные ширины
      MAX_WIDTH: {
        CARD: '400px',
        FORM: '600px',
        CONTENT: '1200px',
        SIDEBAR: '280px',
      }
    },
  },
  
  // Business logic constants
  BUSINESS: {
    CURRENCY: ENV_CONFIG.CURRENCY,
    PAGINATION_SIZE: 20,
    // Analytics constants
    ANALYTICS: {
      TOP_PRODUCTS_LIMIT: 5,
      MOCK_QUANTITY_MIN: 10,
      MOCK_QUANTITY_MAX: 100,
      LOGS_BATCH_SIZE: 10,
      LOGS_SAVE_INTERVAL: 30000, // 30 seconds
      MAX_STORED_LOGS: 500,
    },
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
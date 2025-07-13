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

    // Report view constants
    REPORT: {
      // Chart colors for consistent visualization
      CHART_COLORS: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'],
      
      // Chart dimensions and settings
      CHART: {
        HEIGHT: {
          SMALL: 300,
          MEDIUM: 400,
          LARGE: 500,
        },
        PIE: {
          OUTER_RADIUS: {
            SMALL: 80,
            LARGE: 180,
          },
        },
        MARGIN: {
          DEFAULT: 16,
          LARGE: 24,
        },
      },
      
      // Time and date formatting
      FORMAT: {
        // Locale for number formatting
        NUMBER_LOCALE: 'ru-RU',
        // Hours in day for density chart
        HOURS_PER_DAY: 24,
        // Decimal places for prices
        PRICE_DECIMALS: 2,
        // Decimal places for quantities
        QUANTITY_DECIMALS: 0,
        MAX_QUANTITY_DECIMALS: 2,
      },
      
      // Order status colors mapping
      STATUS_COLORS: {
        COMPLETED: 'success',
        WAITING: 'warning', 
        CANCELLED: 'error',
        IN_PROGRESS: 'info',
        DEFAULT: 'default',
      } as const,
      
      // Table settings
      TABLE: {
        ROW_HEIGHT_PADDING: '48px', // XL + MD spacing
        CELL_PADDING: '4px', // XS spacing
        LAYOUT: 'fixed',
        // Products table specific settings
        PRODUCTS: {
          ROW_HEIGHT: 24,
          SEPARATOR_ROW_HEIGHT: 24,
        },
      },
      
      // Summary card settings
      SUMMARY_CARDS: {
        MIN_WIDTH: '300px',
        FLEX_BASIS: '300px',
        // Custom colors for summary cards
                 COLORS: {
           YELLOW: {
             BACKGROUND: '#ffd700',
             TEXT: '#212121',
           },
         },
      },
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

// Export report constants separately for easier access
export const REPORT = APP_CONFIG.BUSINESS.REPORT;

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
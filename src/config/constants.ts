// Application constants
export const APP_CONFIG = {
  // Application info
  NAME: 'Coffee Shop Manager',
  SUBTITLE: 'Coffee shop management system',
  VERSION: '1.0.0',
  
  // UI Constants
  DEFAULT_LANGUAGE: 'en',
  AVAILABLE_LANGUAGES: ['en', 'ru'],
  
  // Local Storage Keys
  STORAGE_KEYS: {
    TOKEN: 'coffee_shop_token',
    LANGUAGE: 'coffee_shop_language',
    USER_PREFERENCES: 'coffee_shop_preferences',
  },
  
  // API Configuration
  API: {
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },
  
  // Logging Configuration
  LOGGING: {
    MAX_LOGS: 1000,
    DEFAULT_LEVEL: 'INFO',
    CONSOLE_ENABLED: true,
  },
  
  // UI Configuration
  UI: {
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 4000,
    DEBOUNCE_DELAY: 300,
    
    // Theme settings
    THEME: {
      CURRENT_BACKGROUND: 'COFFEE_THEME', // Can be: PRIMARY, COFFEE_THEME, WARM, COOL, MODERN, CLASSIC
    },
    
    // Theme colors
    COLORS: {
      PRIMARY: '#6f4e37',
      SECONDARY: '#8b6f47',
      SUCCESS: '#4caf50',
      ERROR: '#f44336',
      WARNING: '#ff9800',
      INFO: '#2196f3',
      
      // Background colors
      BACKGROUND: {
        // Main app background
        PRIMARY: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        
        // Alternative backgrounds
        COFFEE_THEME: 'linear-gradient(135deg, #f5f1eb 0%, #e8ddd4 100%)',
        WARM: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        COOL: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        MODERN: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        CLASSIC: '#f8f9fa',
        
        // Card/component backgrounds
        CARD: 'rgba(255, 255, 255, 0.95)',
        CARD_HOVER: 'rgba(255, 255, 255, 1)',
        
        // Overlay backgrounds
        OVERLAY: 'rgba(0, 0, 0, 0.5)',
        SIDEBAR: 'rgba(255, 255, 255, 0.98)',
      },
    },
    
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
    ORDER_STATUSES: ['waiting', 'in_progress', 'completed', 'cancelled'],
    CURRENCY: '$',
    PAGINATION_SIZE: 20,
  },
} as const;

// Export individual constants for convenience
export const {
  STORAGE_KEYS,
  API,
  LOGGING,
  UI,
  BUSINESS,
} = APP_CONFIG;

// Environment-based constants
export const ENV = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;

// Theme utilities
export const getAppBackground = (themeName?: keyof typeof APP_CONFIG.UI.COLORS.BACKGROUND): string => {
  const currentTheme = themeName || APP_CONFIG.UI.THEME.CURRENT_BACKGROUND;
  return APP_CONFIG.UI.COLORS.BACKGROUND[currentTheme as keyof typeof APP_CONFIG.UI.COLORS.BACKGROUND] || APP_CONFIG.UI.COLORS.BACKGROUND.PRIMARY;
};

export const getCardBackground = (): string => {
  return APP_CONFIG.UI.COLORS.BACKGROUND.CARD;
};

export const getCardHoverBackground = (): string => {
  return APP_CONFIG.UI.COLORS.BACKGROUND.CARD_HOVER;
}; 
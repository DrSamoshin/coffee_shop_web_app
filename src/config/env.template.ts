// Environment variables template
// Copy this file to .env.local in project root and customize values

/**
 * Environment Variables Configuration
 * 
 * Create .env.local file in project root with these variables:
 * 
 * # Application mode
 * VITE_ADMIN_MODE=true
 * VITE_DEBUG_MODE=true
 * 
 * # API Configuration
 * VITE_API_BASE_URL=http://0.0.0.0:8080
 * VITE_API_TIMEOUT=10000
 * 
 * # Application Settings
 * VITE_APP_NAME="Coffee Shop Manager"
 * VITE_APP_SUBTITLE="Coffee shop management system"
 * VITE_DEFAULT_LANGUAGE=en
 * VITE_CURRENCY=BYN
 * 
 * # Feature flags
 * VITE_ENABLE_LOGGING=true
 * VITE_ENABLE_ANALYTICS=false
 * VITE_ENABLE_EXPERIMENTAL_FEATURES=false
 * 
 * # UI Settings
 * VITE_THEME_MODE=light
 * VITE_ANIMATION_ENABLED=true
 */

// Helper to get environment variable with fallback
const getEnvVar = (key: string, fallback: string = ''): string => {
  return import.meta.env[key] || fallback;
};

const getBoolEnvVar = (key: string, fallback: boolean = false): boolean => {
  const value = import.meta.env[key];
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return fallback;
};

// Environment configuration
export const ENV_CONFIG = {
  // Application mode
  ADMIN_MODE: getBoolEnvVar('VITE_ADMIN_MODE', false),
  DEBUG_MODE: getBoolEnvVar('VITE_DEBUG_MODE', false),
  
  // API Configuration
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'https://coffee-point-api-1011837808330.us-central1.run.app'),
  API_TIMEOUT: parseInt(getEnvVar('VITE_API_TIMEOUT', '10000')),
  
  // Application Settings
  APP_NAME: getEnvVar('VITE_APP_NAME', 'Coffee Shop Manager'),
  APP_SUBTITLE: getEnvVar('VITE_APP_SUBTITLE', 'Coffee shop management system'),
  DEFAULT_LANGUAGE: getEnvVar('VITE_DEFAULT_LANGUAGE', 'en'),
  CURRENCY: getEnvVar('VITE_CURRENCY', 'BYN'),
  
  // Feature flags
  ENABLE_LOGGING: getBoolEnvVar('VITE_ENABLE_LOGGING', true),
  ENABLE_ANALYTICS: getBoolEnvVar('VITE_ENABLE_ANALYTICS', false),
  ENABLE_EXPERIMENTAL_FEATURES: getBoolEnvVar('VITE_ENABLE_EXPERIMENTAL_FEATURES', false),
  
  // UI Settings
  THEME_MODE: getEnvVar('VITE_THEME_MODE', 'light'),
  ANIMATION_ENABLED: getBoolEnvVar('VITE_ANIMATION_ENABLED', true),
  
  // Environment detection (simplified)
  IS_DEVELOPMENT: import.meta.env.DEV,
  MODE: import.meta.env.MODE || 'development',
} as const;

export default ENV_CONFIG; 
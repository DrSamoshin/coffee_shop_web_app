// TEMPLATE FILE: Copy this to secrets.ts and fill in real values
// This file CAN be committed to version control as it contains no real secrets

// Test tokens and sensitive data
export const SECRETS = {
  // API Keys (add real keys here in production)
  API_KEYS: {
    DEVELOPMENT: 'dev-api-key-here',
    STAGING: 'staging-api-key-here', 
    PRODUCTION: 'prod-api-key-here',
  },
  
  // Database URLs (if needed)
  DATABASE_URLS: {
    DEVELOPMENT: 'dev-db-url-here',
    STAGING: 'staging-db-url-here',
    PRODUCTION: 'prod-db-url-here',
  },
  
  // Third-party service keys
  THIRD_PARTY: {
    ANALYTICS_KEY: 'analytics-key-here',
    PAYMENT_SECRET: 'payment-secret-here',
    NOTIFICATION_KEY: 'notification-key-here',
  },
  
  // Admin credentials
  ADMIN: {
    DEFAULT_USERNAME: 'admin',
    DEFAULT_PASSWORD: 'change-me-in-production',
  },
} as const;

// Helper function to get secrets safely
export const getSecret = (path: string): string | undefined => {
  const keys = path.split('.');
  let value: unknown = SECRETS;
  
  for (const key of keys) {
    if (typeof value === 'object' && value !== null && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  
  return typeof value === 'string' ? value : undefined;
};

// Environment-specific getters
export const getApiKey = (env: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION'): string => {
  return SECRETS.API_KEYS[env];
};

export default SECRETS; 
# Configuration Guide

This document describes the configuration structure of the Coffee Shop Web Application.

## 📁 Configuration Structure

```
src/config/
├── index.ts          # Main configuration file
├── constants.ts      # Application constants
├── secrets.ts        # Sensitive data (in .gitignore)
└── secrets.template.ts # Template for secrets file
```

## 🔧 Main Configuration (`src/config/index.ts`)

The main configuration file exports centralized app settings:

```typescript
import { config, apiConfig, appConfig } from '../config';

// Full configuration object
const fullConfig = config;

// Individual config sections
const api = apiConfig;        // API settings
const app = appConfig;        // App metadata
const logging = loggingConfig; // Logging settings
const ui = uiConfig;          // UI constants
const storage = storageConfig; // Storage keys
const business = businessConfig; // Business logic
```

### Available Configuration Sections:

- **`api`**: API base URL, timeout, retry settings
- **`app`**: Application name, version, supported languages
- **`logging`**: Log levels, max logs count, console settings
- **`ui`**: Colors, breakpoints, animation durations
- **`storage`**: LocalStorage key names
- **`business`**: Order statuses, currency, pagination

## 📊 Constants (`src/config/constants.ts`)

Contains all application constants organized by category:

```typescript
import { APP_CONFIG, STORAGE_KEYS, UI, BUSINESS } from '../config/constants';

// Access specific constants
const tokenKey = STORAGE_KEYS.TOKEN;
const primaryColor = UI.COLORS.PRIMARY;
const orderStatuses = BUSINESS.ORDER_STATUSES;
```

## 🔐 Secrets Management

### Setup for New Developers:

1. Copy the template file:
   ```bash
   cp src/config/secrets.template.ts src/config/secrets.ts
   ```

2. Fill in real values in `secrets.ts`:
   ```typescript
   export const SECRETS = {
     TEST_TOKEN: 'your-actual-test-token-here',
     API_KEYS: {
       DEVELOPMENT: 'dev-key',
       STAGING: 'staging-key',
       PRODUCTION: 'prod-key'
     }
   };
   ```

3. **Never commit** `secrets.ts` to version control!

### Using Secrets:

```typescript
import { getTestToken, getApiKey } from '../config/secrets';

// Get test token
const token = getTestToken();

// Get environment-specific API key
const apiKey = getApiKey('DEVELOPMENT');
```

## 🌍 Environment Variables

You can override API URL using environment variables:

```bash
# Development
VITE_API_URL=https://dev-api.example.com

# Production  
VITE_API_URL=https://api.example.com
```

## 🗃️ Storage Keys

All localStorage keys are centralized and type-safe:

```typescript
import { getStorageKey } from '../config';

// Get storage keys
const tokenKey = getStorageKey('TOKEN');
const languageKey = getStorageKey('LANGUAGE');
const prefsKey = getStorageKey('USER_PREFERENCES');

// Use with localStorage
localStorage.setItem(tokenKey, userToken);
const savedLang = localStorage.getItem(languageKey);
```

## 🎨 UI Configuration

Access theme colors and breakpoints:

```typescript
import { uiConfig } from '../config';

// Colors
const primary = uiConfig.colors.PRIMARY;    // '#6f4e37'
const error = uiConfig.colors.ERROR;        // '#f44336'

// Breakpoints  
const mobile = uiConfig.breakpoints.SM;     // 600
const desktop = uiConfig.breakpoints.LG;    // 1280

// Timings
const animDuration = uiConfig.animationDuration; // 300ms
const toastDuration = uiConfig.toastDuration;    // 4000ms
```

## 🏪 Business Logic Constants

```typescript
import { businessConfig } from '../config';

// Order statuses
const statuses = businessConfig.ORDER_STATUSES;
// ['waiting', 'in_progress', 'completed', 'cancelled']

// Currency symbol
const currency = businessConfig.CURRENCY; // '$'

// Pagination
const pageSize = businessConfig.PAGINATION_SIZE; // 20
```

## 📝 Best Practices

1. **Always use configuration** instead of hardcoded values
2. **Never commit secrets.ts** to version control
3. **Use environment variables** for environment-specific settings
4. **Update constants.ts** when adding new hardcoded values
5. **Document new configuration** options in this file

## 🔄 Migration from Old Code

If you have hardcoded values in your components, replace them:

```typescript
// ❌ Old way
const API_URL = 'http://0.0.0.0:8080';
localStorage.setItem('coffee_shop_token', token);

// ✅ New way  
import { apiConfig, getStorageKey } from '../config';
const API_URL = apiConfig.baseUrl;
localStorage.setItem(getStorageKey('TOKEN'), token);
```

## 🚀 Development vs Production

Configuration automatically adapts based on environment:

```typescript
import { isDev, isProd, getEnvMode } from '../config';

if (isDev) {
  console.log('Development mode - extra logging enabled');
}

if (isProd) {
  // Production optimizations
}

const mode = getEnvMode(); // 'development' | 'production' | 'test'
``` 
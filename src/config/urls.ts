import ENV_CONFIG from './env.template';

/**
 * Centralized API endpoints configuration
 * Following architecture contract: all endpoints as constants in one place
 * All endpoints end with '/' for consistency and to avoid 307 redirects
 */

// Production API URL
const PRODUCTION_API_URL = 'https://coffee-point-api-317780828805.europe-west3.run.app';

/**
 * All API endpoints grouped by functionality
 * Following DRY and modular principles
 */
export const API_ENDPOINTS = {
  // Base endpoints
  BASE: ENV_CONFIG.API_BASE_URL,
  HEALTH: '/health/',
  HEALTH_APP: '/health/app/',
  HEALTH_TOKEN: '/health/token/',
  DOCS: '/docs/',
  REDOC: '/redoc/',
  OPENAPI: '/openapi.json',

  // Coffee shop info
  COFFEE_SHOP_INFO: '/coffee-shop/info/',

  // Admin endpoints
  ADMIN: {
    IMPORT_CATEGORIES: '/admin/import-categories/',
    IMPORT_PRODUCTS: '/admin/import-products/',
    MIGRATE_POINT_DB: '/admin/migrate-point-db/',
    MIGRATE_USERS_DB: '/admin/migrate-users-db/',
  },

  // Check lists endpoints
  CHECK_LISTS: '/check-lists/',
  CHECK_LISTS_START: '/check-lists/start/',
  CHECK_LISTS_END: '/check-lists/end/',

  // Authentication endpoints
  AUTH: {
    TOKEN_CHECK: '/health/token/',
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    REGISTER: '/auth/register/',
  },

  // Categories endpoints
  CATEGORIES: '/categories/',

  // Products endpoints
  PRODUCTS: '/products/',
  PRODUCTS_ONLINE_SHOP: '/products/online-shop/',

  // Product orders endpoints
  PRODUCT_ORDERS: '/product-orders/',

  // Recipe items endpoints
  RECIPE_ITEMS: '/recipe-items/',

  // Orders endpoints
  ORDERS: '/orders/',
  ORDERS_SHIFT: '/orders/shift-orders/',
  ORDERS_WAITING: '/orders/waiting-shift-orders/',

  // Shifts endpoints
  SHIFTS: '/shifts/',
  SHIFTS_ACTIVE: '/shifts/active-shifts/',

  // Employee shifts endpoints
  EMPLOYEE_SHIFTS: '/employee-shifts/',
  EMPLOYEE_SHIFTS_ACTIVE: '/employee-shifts/active-employee-shifts/',

  // Employees endpoints
  EMPLOYEES: '/employees/',
  EMPLOYEES_AVAILABLE: '/employees/available/',
  EMPLOYEES_DEACTIVATED: '/employees/deactivated/',

  // Items endpoints
  ITEMS: '/items/',

  // Store items endpoints
  STORE_ITEMS: '/store-items/',
  STORE_ITEMS_ADD: '/store-items/add/',
  STORE_ITEMS_CALCULATION: '/store-items/calculation/',
  STORE_ITEMS_REMOVE: '/store-items/remove/',

  // Suppliers endpoints
  SUPPLIERS: '/suppliers/',
  SUPPLIERS_DEACTIVATED: '/suppliers/deactivated/',

  // Supplies endpoints
  SUPPLIES: '/supplies/',

  // Users endpoints
  USERS: '/users/',

  // Files endpoints
  FILES: '/files/',
  FILES_UPLOAD: '/files/upload-image/',
  FILES_DELETE: '/files/delete/',

  // Clients endpoints
  CLIENTS: '/clients/',

  // Analytics endpoints
  ANALYTICS: '/analytics/',
  ANALYTICS_ACTIVE_SHIFT: '/analytics/active-shift-report/',

  // Constants endpoints - grouped by category
  CONSTANTS: {
    PAYMENT_METHODS: '/constants/payment-methods/',
    ORDER_TYPES: '/constants/order-types/',
    ORDER_STATUSES: '/constants/order-statuses/',
    EMPLOYEE_POSITIONS: '/constants/employee-positions/',
    ITEM_MEASUREMENTS: '/constants/item-measurements/',
  },
} as const;

/**
 * Dynamic endpoint builders for parametrized URLs
 * Following DRY principle - reusable functions for common patterns
 */
export const ENDPOINT_BUILDERS = {
  // Single resource by ID
  byId: (baseEndpoint: string, id: string): string => `${baseEndpoint}${id}/`,
  
  // Admin operations
  adminMigratePointDb: (dbName: string): string => `${API_ENDPOINTS.ADMIN.MIGRATE_POINT_DB}${dbName}/`,
  
  // Check lists
  checkList: (id: string): string => ENDPOINT_BUILDERS.byId(API_ENDPOINTS.CHECK_LISTS, id),
  
  // Categories
  category: (id: string): string => ENDPOINT_BUILDERS.byId(API_ENDPOINTS.CATEGORIES, id),
  
  // Products
  product: (id: string): string => ENDPOINT_BUILDERS.byId(API_ENDPOINTS.PRODUCTS, id),
  
  // Product orders
  productOrder: (id: string): string => ENDPOINT_BUILDERS.byId(API_ENDPOINTS.PRODUCT_ORDERS, id),
  
  // Recipe items
  recipeItem: (id: string): string => ENDPOINT_BUILDERS.byId(API_ENDPOINTS.RECIPE_ITEMS, id),
  
  // Orders
  order: (id: string): string => ENDPOINT_BUILDERS.byId(API_ENDPOINTS.ORDERS, id),
  orderStatusUpdate: (id: string): string => `${API_ENDPOINTS.ORDERS}status-update/${id}/`,
  
  // Employees
  employee: (id: string): string => ENDPOINT_BUILDERS.byId(API_ENDPOINTS.EMPLOYEES, id),
  employeeActivate: (id: string): string => `${API_ENDPOINTS.EMPLOYEES}activate/${id}/`,
  
  // Employee shifts
  employeeShiftEndUpdate: (id: string): string => `${API_ENDPOINTS.EMPLOYEE_SHIFTS}shift-end-update/${id}/`,
  
  // Items
  item: (id: string): string => ENDPOINT_BUILDERS.byId(API_ENDPOINTS.ITEMS, id),
  
  // Store items
  storeItem: (id: string): string => ENDPOINT_BUILDERS.byId(API_ENDPOINTS.STORE_ITEMS, id),
  
  // Suppliers
  supplier: (id: string): string => ENDPOINT_BUILDERS.byId(API_ENDPOINTS.SUPPLIERS, id),
  supplierActivate: (id: string): string => `${API_ENDPOINTS.SUPPLIERS}activate/${id}/`,
  
  // Supplies
  supply: (id: string): string => ENDPOINT_BUILDERS.byId(API_ENDPOINTS.SUPPLIES, id),
  
  // Shifts
  shift: (id: string): string => ENDPOINT_BUILDERS.byId(API_ENDPOINTS.SHIFTS, id),
  shiftStart: (id: string): string => `${API_ENDPOINTS.SHIFTS}start/${id}/`,
  shiftEnd: (id: string): string => `${API_ENDPOINTS.SHIFTS}end/${id}/`,
  shiftStartUpdate: (id: string): string => `${API_ENDPOINTS.SHIFTS}shift-start-update/${id}/`,
  
  // Analytics
  analyticsShiftReport: (id: string): string => `${API_ENDPOINTS.ANALYTICS}shift-report/${id}/`,
  
  // Clients
  client: (id: string): string => ENDPOINT_BUILDERS.byId(API_ENDPOINTS.CLIENTS, id),
  
  // Users
  user: (id: string): string => ENDPOINT_BUILDERS.byId(API_ENDPOINTS.USERS, id),
} as const;

/**
 * Base URL configuration
 * Following environment-specific config principle
 */
export const getApiUrl = (endpoint: string): string => {
  let baseUrl: string;
  
  if (ENV_CONFIG.USE_API_PROXY) {
    baseUrl = '/api'; // Proxy mode
  } else {
    baseUrl = PRODUCTION_API_URL; // Direct production URL
  }
  
  return endpoint.startsWith('/') ? `${baseUrl}${endpoint}` : `${baseUrl}/${endpoint}`;
};

/**
 * URL builder with query parameters
 * Following DRY principle - reusable utility
 */
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  let url = getApiUrl(endpoint);
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

/**
 * Main configuration export
 * Following centralized config principle
 */
export const URL_CONFIG = {
  API_BASE: ENV_CONFIG.USE_API_PROXY ? '/api' : PRODUCTION_API_URL,
  ENDPOINTS: API_ENDPOINTS,
  BUILDERS: ENDPOINT_BUILDERS,
  getApiUrl,
  buildApiUrl,
} as const;
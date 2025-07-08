import ENV_CONFIG from './env.template';

/**
 * Единая точка хранения всех URL приложения
 * Согласно правилам проекта - централизованная конфигурация
 */

// Константы URL для разных режимов
const PRODUCTION_API_URL = 'https://coffee-point-api-317780828805.europe-west3.run.app';

// API endpoints
export const API_ENDPOINTS = {
  // Базовые
  BASE: ENV_CONFIG.API_BASE_URL,
  HEALTH: '/health',
  COFFEE_SHOP_INFO: '/coffee-shop/info',

  // Аутентификация
  AUTH: {
    TOKEN_CHECK: '/health/token/',
  },

  // Категории
  CATEGORIES: '/categories',

  // Продукты
  PRODUCTS: '/products',
  PRODUCTS_ONLINE_SHOP: '/products/online-shop',

  // Заказы
  ORDERS: '/orders',
  ORDERS_SHIFT: '/orders/shift-orders',

  // Смены
  SHIFTS: '/shifts',
  SHIFTS_ACTIVE: '/shifts/active',

  // Сотрудники
  EMPLOYEES: '/employees',
  EMPLOYEES_AVAILABLE: '/employees/available',
  EMPLOYEES_DEACTIVATED: '/employees/deactivated',
  EMPLOYEES_POSITIONS: '/constants/employee-positions',

  // Файлы
  FILES: '/files',
  FILES_UPLOAD: '/files/upload-image',

  // Товары
  ITEMS: '/items',
  ITEMS_MEASUREMENTS: '/constants/item-measurements',

  // Поставщики
  SUPPLIERS: '/suppliers',
  SUPPLIERS_DEACTIVATED: '/suppliers/deactivated',

  // Поставки
  SUPPLIES: '/supplies',

  // Склад
  STORE_ITEMS: '/store-items',
  STORE_ITEMS_CALCULATION: '/store-items/calculation',
  STORE_ITEMS_REMOVE: '/store-items/remove',

  // Клиенты
  CLIENTS: '/clients',

  // Аналитика
  ANALYTICS: '/analytics',
  ANALYTICS_ACTIVE_SHIFT: '/analytics/active-shift-report',

  // Константы
  CONSTANTS: {
    PAYMENT_METHODS: '/constants/payment-methods',
    ORDER_TYPES: '/constants/order-types',
    ORDER_STATUSES: '/constants/order-statuses',
  },
} as const;

// Функция для получения полного URL
export const getApiUrl = (endpoint: string): string => {
  // Логика выбора baseUrl:
  // 1. Если USE_API_PROXY=true - используем прокси /api
  // 2. Если USE_API_PROXY=false - используем прямой production URL
  let baseUrl: string;
  
  if (ENV_CONFIG.USE_API_PROXY) {
    baseUrl = '/api'; // Прокси
  } else {
    // Прямой URL - всегда production в preview/build режиме
    baseUrl = PRODUCTION_API_URL;
  }
  
  return endpoint.startsWith('/') ? `${baseUrl}${endpoint}` : `${baseUrl}/${endpoint}`;
};

// Функция для построения URL с параметрами
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

// Экспорт конфигурации
export const URL_CONFIG = {
  API_BASE: ENV_CONFIG.USE_API_PROXY ? '/api' : PRODUCTION_API_URL,
  ENDPOINTS: API_ENDPOINTS,
  getApiUrl,
  buildApiUrl,
} as const; 
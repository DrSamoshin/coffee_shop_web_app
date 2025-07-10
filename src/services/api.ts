import axios, { type AxiosInstance, type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { logger } from './logger';
import { apiConfig, getStorageKey } from '../config';
import { API_ENDPOINTS, ENDPOINT_BUILDERS } from '../config/urls';
import fileLogger from './fileLogger';
import type {
  Category,
  Product,
  ProductCreate,
  Order,
  OrderCreate,
  Shift,
  Employee,
  Supplier,
  StoreItem,
  StoreItemCreate,
  StoreItemCalculation,
  ConstantItem,
  ActiveShiftReport,
  Item,
  Supply
} from '../types/api';
import { OrderStatus } from '../types/api';
import { APP_CONFIG } from '../config/constants';

// Interfaces for typing
interface RequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    startTime: number;
    timer: () => void;
  };
}

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string;
    };
    status?: number;
    statusText?: string;
  };
  message?: string;
}

interface FileResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  created_at: string;
}

interface UploadResponse {
  url: string;
  filename: string;
}

class ApiService {
  private api: AxiosInstance;
  private baseURL = import.meta.env.PROD ? 
    'https://coffee-point-api-317780828805.europe-west3.run.app' : 
    apiConfig.baseUrl;

  constructor() {
    // Debug: check that baseURL is correct
    const debugInfo = {
      baseURL: this.baseURL,
      apiConfig: apiConfig,
      isProduction: import.meta.env.PROD,
      mode: import.meta.env.MODE,
      envVars: {
        USE_API_PROXY: import.meta.env.VITE_USE_API_PROXY,
        API_BASE_URL: import.meta.env.VITE_API_BASE_URL
      }
    };
    
    logger.debug('ApiService', 'Constructor initialized', debugInfo);
    logger.debug('ApiService', `TOKEN_CHECK endpoint: ${API_ENDPOINTS.AUTH.TOKEN_CHECK}`);
    logger.debug('ApiService', `Full URL will be: ${this.baseURL}${API_ENDPOINTS.AUTH.TOKEN_CHECK}`);
    fileLogger.logConfigDebug('ApiService initialized', debugInfo);

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor for adding token to headers
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token) {
          // Ensure token contains only printable ASCII characters
          const cleanToken = token.split('').filter(char => {
            const code = char.charCodeAt(0);
            return code >= 32 && code <= 126; // printable ASCII range
          }).join('');
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${cleanToken}`;
        }
        
        // Log request
        const timer = logger.startTimer(`${config.method?.toUpperCase()} ${config.url}`);
        const configWithMetadata = config as RequestConfig;
        configWithMetadata.metadata = { startTime: performance.now(), timer };
        
        logger.apiRequest(
          config.method?.toUpperCase() || 'UNKNOWN',
          config.url || '',
          config.data
        );
        
        return config;
      },
      (error: AxiosError) => {
        logger.apiError('REQUEST', 'Unknown URL', error);
        return Promise.reject(error);
      }
    );

    // Interceptor for handling errors and logging responses
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful response
        const config = response.config as RequestConfig;
        const duration = config.metadata ? 
          Math.round(performance.now() - config.metadata.startTime) : undefined;
          
        if (config.metadata?.timer) {
          config.metadata.timer();
        }
        
        logger.apiResponse(
          config.method?.toUpperCase() || 'UNKNOWN',
          config.url || '',
          response.status,
          response.data,
          duration
        );
        
        return response;
      },
      (error: AxiosError) => {
        // Log error
        const config = error.config as RequestConfig;
        
        if (config?.metadata?.timer) {
          config.metadata.timer();
        }
        
        logger.apiError(
          config?.method?.toUpperCase() || 'UNKNOWN',
          config?.url || 'Unknown URL',
          error
        );
        
        fileLogger.logApiError(
          config?.method?.toUpperCase() || 'UNKNOWN',
          config?.url || 'Unknown URL',
          error
        );
        
        if (error.response?.status === 401) {
          // Token is invalid, remove it and redirect to login page
          localStorage.removeItem(getStorageKey('TOKEN'));
          logger.warn('AUTH', 'Token removed due to 401 response');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  setToken(token: string): void {
    localStorage.setItem(getStorageKey('TOKEN'), token);
  }

  getToken(): string | null {
    return localStorage.getItem(getStorageKey('TOKEN'));
  }

  clearToken(): void {
    localStorage.removeItem(getStorageKey('TOKEN'));
  }

  // Token check
  async checkToken(): Promise<{ isValid: boolean; error?: string }> {
    try {
      logger.debug('ApiService', 'Starting token validation');
      logger.debug('ApiService', `endpoint = ${API_ENDPOINTS.AUTH.TOKEN_CHECK}`);
      logger.debug('ApiService', `baseURL = ${this.baseURL}`);
      logger.debug('ApiService', `full URL = ${this.baseURL}${API_ENDPOINTS.AUTH.TOKEN_CHECK}`);
      
      const response = await this.api.get(API_ENDPOINTS.AUTH.TOKEN_CHECK);
      logger.info('ApiService', 'Token validation successful', {
        status: response.status,
        data: response.data
      });
      return { isValid: true };
    } catch (error: unknown) {
      logger.warn('ApiService', 'Token validation failed');
      
      let errorMessage = 'Unknown error';
      
      const axiosError = error as ApiErrorResponse;
      if (axiosError.response?.data?.detail) {
        errorMessage = axiosError.response.data.detail;
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }
      
      const errorToLog = error instanceof Error ? error : new Error(String(error));
      logger.error('ApiService', 'Token validation error details', errorToLog, {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        message: errorMessage
      });
      
      return { 
        isValid: false, 
        error: errorMessage 
      };
    }
  }

  // General coffee shop info
  async getCoffeeShopInfo(): Promise<Record<string, unknown>> {
    const response = await this.api.get(API_ENDPOINTS.COFFEE_SHOP_INFO);
    return response.data;
  }

  // === CATEGORIES ===
  async getCategories(): Promise<Category[]> {
    const response = await this.api.get(API_ENDPOINTS.CATEGORIES);
    return response.data;
  }

  async createCategory(name: string): Promise<Category> {
    const response = await this.api.post(API_ENDPOINTS.CATEGORIES, { name });
    return response.data;
  }

  async updateCategory(id: string, name: string): Promise<Category> {
    const response = await this.api.put(ENDPOINT_BUILDERS.category(id), { name });
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.api.delete(ENDPOINT_BUILDERS.category(id));
  }

  // === PRODUCTS ===
  async getProducts(): Promise<Product[]> {
    const response = await this.api.get(API_ENDPOINTS.PRODUCTS);
    return response.data;
  }

  async getOnlineShopProducts(): Promise<Product[]> {
    const response = await this.api.get(API_ENDPOINTS.PRODUCTS_ONLINE_SHOP);
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.api.get(ENDPOINT_BUILDERS.product(id));
    return response.data;
  }

  async createProduct(product: ProductCreate): Promise<Product> {
    const response = await this.api.post(API_ENDPOINTS.PRODUCTS, product);
    return response.data;
  }

  async updateProduct(id: string, product: Partial<ProductCreate>): Promise<Product> {
    const response = await this.api.put(ENDPOINT_BUILDERS.product(id), product);
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.api.delete(ENDPOINT_BUILDERS.product(id));
  }

  // === ORDERS ===
  async getOrders(): Promise<Order[]> {
    const response = await this.api.get(API_ENDPOINTS.ORDERS);
    return response.data;
  }

  async getOrder(id: string): Promise<Order> {
    const response = await this.api.get(ENDPOINT_BUILDERS.order(id));
    return response.data;
  }

  async createOrder(order: OrderCreate): Promise<Order> {
    const response = await this.api.post(API_ENDPOINTS.ORDERS, order);
    return response.data;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const response = await this.api.patch(ENDPOINT_BUILDERS.order(id), { status });
    return response.data;
  }

  async getShiftOrders(): Promise<Order[]> {
    const response = await this.api.get(API_ENDPOINTS.ORDERS_SHIFT);
    return response.data;
  }

  async getWaitingShiftOrders(): Promise<Order[]> {
    const response = await this.api.get(API_ENDPOINTS.ORDERS_WAITING);
    return response.data;
  }

  // === SHIFTS ===
  async getShifts(): Promise<Shift[]> {
    const response = await this.api.get(API_ENDPOINTS.SHIFTS);
    return response.data;
  }

  async getActiveShifts(): Promise<Shift[]> {
    const response = await this.api.get(API_ENDPOINTS.SHIFTS_ACTIVE);
    return response.data;
  }

  async startShift(shiftId: string): Promise<Shift> {
    const response = await this.api.post(ENDPOINT_BUILDERS.shiftStart(shiftId));
    return response.data;
  }

  async endShift(shiftId: string): Promise<Shift> {
    const response = await this.api.post(ENDPOINT_BUILDERS.shiftEnd(shiftId));
    return response.data;
  }

  // === EMPLOYEES ===
  async getEmployees(): Promise<Employee[]> {
    const response = await this.api.get(API_ENDPOINTS.EMPLOYEES);
    return response.data;
  }

  async getAvailableEmployees(): Promise<Employee[]> {
    const response = await this.api.get(API_ENDPOINTS.EMPLOYEES_AVAILABLE);
    return response.data;
  }

  async getDeactivatedEmployees(): Promise<Employee[]> {
    const response = await this.api.get(API_ENDPOINTS.EMPLOYEES_DEACTIVATED);
    return response.data;
  }

  async createEmployee(data: { name: string; position: string }): Promise<Employee> {
    const response = await this.api.post(API_ENDPOINTS.EMPLOYEES, data);
    return response.data;
  }

  async updateEmployee(id: string, data: { name: string; position: string }): Promise<Employee> {
    const response = await this.api.put(ENDPOINT_BUILDERS.employee(id), data);
    return response.data;
  }

  async deleteEmployee(id: string): Promise<void> {
    await this.api.delete(ENDPOINT_BUILDERS.employee(id));
  }

  async activateEmployee(id: string): Promise<Employee> {
    const response = await this.api.post(ENDPOINT_BUILDERS.employeeActivate(id));
    return response.data;
  }

  // === CONSTANTS ===
  async getEmployeePositions(): Promise<string[]> {
    const response = await this.api.get(API_ENDPOINTS.CONSTANTS.EMPLOYEE_POSITIONS);
    return response.data.map((item: ConstantItem) => item.value);
  }

  async getItemMeasurements(): Promise<string[]> {
    const response = await this.api.get(API_ENDPOINTS.CONSTANTS.ITEM_MEASUREMENTS);
    return response.data.map((item: ConstantItem) => item.value);
  }

  // === FILES ===
  async getFiles(): Promise<FileResponse[]> {
    const response = await this.api.get('/files/');
    return response.data;
  }

  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.api.post('/files/upload-image/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteFile(url: string): Promise<void> {
    logger.debug('ApiService', 'Deleting file', { image_url: url });
    await this.api.post('/files/delete/', { image_url: url });
  }

  // === STORE ITEMS ===
  async getStoreItems(): Promise<StoreItem[]> {
    const response = await this.api.get(API_ENDPOINTS.STORE_ITEMS);
    return response.data;
  }

  async createStoreItem(storeItem: StoreItemCreate): Promise<StoreItem> {
    const response = await this.api.post(API_ENDPOINTS.STORE_ITEMS, storeItem);
    return response.data;
  }

  async addStoreItem(storeItem: StoreItemCreate): Promise<StoreItem> {
    const response = await this.api.post(API_ENDPOINTS.STORE_ITEMS_ADD, storeItem);
    return response.data;
  }

  async updateStoreItem(id: string, storeItem: StoreItemCreate): Promise<StoreItem> {
    const response = await this.api.put(ENDPOINT_BUILDERS.storeItem(id), storeItem);
    return response.data;
  }

  async getStoreItemsCalculation(): Promise<StoreItemCalculation[]> {
    const response = await this.api.get(API_ENDPOINTS.STORE_ITEMS_CALCULATION);
    return response.data;
  }

  async removeStoreItem(data: { item_id: string; amount: number; price_per_item: number }): Promise<Record<string, unknown>> {
    const response = await this.api.post(API_ENDPOINTS.STORE_ITEMS_REMOVE, data);
    return response.data;
  }



  // === CLIENTS ===
  async getClients(): Promise<Record<string, unknown>[]> {
    const response = await this.api.get(API_ENDPOINTS.CLIENTS);
    return response.data;
  }

  // === ANALYTICS ===
  async getActiveShiftReport(): Promise<ActiveShiftReport> {
    const response = await this.api.get(API_ENDPOINTS.ANALYTICS_ACTIVE_SHIFT);
    return response.data;
  }

  // === ANALYTICS (basic client-side calculations) ===
  async getAnalyticsData(): Promise<Record<string, unknown>> {
    try {
      const [orders, products] = await Promise.all([
        this.getOrders(),
        this.getProducts()
      ]);

      // Calculate analytics based on received data
      const completedOrders = orders.filter(order => order.status === OrderStatus.COMPLETED);
      const totalRevenue = completedOrders.reduce((sum, order) => sum + parseFloat(order.price), 0);
      const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

      // Group orders by day
      const dailyRevenue = this.groupOrdersByDay(completedOrders);

      // Top products (basic mock, as more complex logic is needed)
      const topProducts = products.slice(0, APP_CONFIG.BUSINESS.ANALYTICS.TOP_PRODUCTS_LIMIT).map(product => ({
        product_name: product.name,
        total_quantity: Math.floor(Math.random() * (APP_CONFIG.BUSINESS.ANALYTICS.MOCK_QUANTITY_MAX - APP_CONFIG.BUSINESS.ANALYTICS.MOCK_QUANTITY_MIN) + APP_CONFIG.BUSINESS.ANALYTICS.MOCK_QUANTITY_MIN), // Imitation
        total_revenue: parseFloat(product.price) * Math.floor(Math.random() * (APP_CONFIG.BUSINESS.ANALYTICS.MOCK_QUANTITY_MAX - APP_CONFIG.BUSINESS.ANALYTICS.MOCK_QUANTITY_MIN) + APP_CONFIG.BUSINESS.ANALYTICS.MOCK_QUANTITY_MIN)
      }));

      return {
        totalRevenue,
        totalOrders: completedOrders.length,
        averageOrderValue,
        topProducts,
        dailyRevenue
      };
    } catch (error: unknown) {
      const errorToLog = error instanceof Error ? error : new Error(String(error));
      logger.error('ApiService', 'Error getting analytics data', errorToLog);
      throw error;
    }
  }

  private groupOrdersByDay(orders: Order[]): Array<{ date: string; revenue: number; orders: number }> {
    const grouped = orders.reduce((acc, order) => {
      const date = new Date(order.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { revenue: 0, orders: 0 };
      }
      acc[date].revenue += parseFloat(order.price);
      acc[date].orders += 1;
      return acc;
    }, {} as Record<string, { revenue: number; orders: number }>);

    return Object.entries(grouped)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // === CONSTANTS ===
  async getPaymentMethods(): Promise<string[]> {
    const response = await this.api.get(API_ENDPOINTS.CONSTANTS.PAYMENT_METHODS);
    return response.data.map((item: ConstantItem) => item.value);
  }

  async getOrderTypes(): Promise<string[]> {
    const response = await this.api.get(API_ENDPOINTS.CONSTANTS.ORDER_TYPES);
    return response.data.map((item: ConstantItem) => item.value);
  }

  async getOrderStatuses(): Promise<string[]> {
    const response = await this.api.get(API_ENDPOINTS.CONSTANTS.ORDER_STATUSES);
    return response.data.map((item: ConstantItem) => item.value);
  }

  // === SUPPLIERS ===
  async getSuppliers(): Promise<Supplier[]> {
    const response = await this.api.get(API_ENDPOINTS.SUPPLIERS);
    return response.data;
  }

  async getDeactivatedSuppliers(): Promise<Supplier[]> {
    const response = await this.api.get(API_ENDPOINTS.SUPPLIERS_DEACTIVATED);
    return response.data;
  }

  async createSupplier(name: string): Promise<Supplier> {
    const response = await this.api.post(API_ENDPOINTS.SUPPLIERS, { name });
    return response.data;
  }

  async updateSupplier(id: string, name: string): Promise<Supplier> {
    const response = await this.api.put(ENDPOINT_BUILDERS.supplier(id), { name });
    return response.data;
  }

  async deleteSupplier(id: string): Promise<void> {
    await this.api.delete(ENDPOINT_BUILDERS.supplier(id));
  }

  async activateSupplier(id: string): Promise<Supplier> {
    const response = await this.api.post(ENDPOINT_BUILDERS.supplierActivate(id));
    return response.data;
  }

  // === ITEMS ===
  async getItems(): Promise<Item[]> {
    const response = await this.api.get(API_ENDPOINTS.ITEMS);
    return response.data;
  }

  async createItem(item: { name: string; measurement: string }): Promise<Item> {
    const response = await this.api.post(API_ENDPOINTS.ITEMS, item);
    return response.data;
  }

  async updateItem(id: string, item: { name: string; measurement: string }): Promise<Item> {
    const response = await this.api.put(ENDPOINT_BUILDERS.item(id), item);
    return response.data;
  }

  async deleteItem(id: string): Promise<void> {
    await this.api.delete(ENDPOINT_BUILDERS.item(id));
  }

  // === SUPPLIES ===
  async getSupplies(): Promise<Supply[]> {
    const response = await this.api.get(API_ENDPOINTS.SUPPLIES);
    return response.data;
  }

  async createSupply(supply: { date: string; supplier_id: string }): Promise<Supply> {
    const response = await this.api.post(API_ENDPOINTS.SUPPLIES, supply);
    return response.data;
  }

  async updateSupply(id: string, supply: { date: string; supplier_id: string }): Promise<Supply> {
    const response = await this.api.put(ENDPOINT_BUILDERS.supply(id), supply);
    return response.data;
  }

  async deleteSupply(id: string): Promise<void> {
    await this.api.delete(ENDPOINT_BUILDERS.supply(id));
  }
}

export const apiService = new ApiService(); 
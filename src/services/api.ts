import axios, { type AxiosInstance } from 'axios';
import { logger } from './logger';
import { apiConfig, getStorageKey } from '../config';
import type {
  Category,
  Product,
  ProductCreate,
  Order,
  OrderCreate,
  Shift,
  Employee,
  Item,
  Supplier,
  Supply
} from '../types/api';
import { OrderStatus } from '../types/api';

class ApiService {
  private api: AxiosInstance;
  private baseURL = apiConfig.baseUrl;

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor для добавления токена в каждый запрос
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(getStorageKey('TOKEN'));
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Логируем запрос
        const timer = logger.startTimer(`${config.method?.toUpperCase()} ${config.url}`);
        (config as any).metadata = { startTime: performance.now(), timer };
        
        logger.apiRequest(
          config.method?.toUpperCase() || 'UNKNOWN',
          config.url || '',
          config.data
        );
        
        return config;
      },
      (error) => {
        logger.apiError('REQUEST', 'Unknown URL', error);
        return Promise.reject(error);
      }
    );

    // Interceptor для обработки ошибок и логирования ответов
    this.api.interceptors.response.use(
      (response) => {
        // Логируем успешный ответ
        const config = response.config as any;
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
      (error) => {
        // Логируем ошибку
        const config = error.config as any;
        
        if (config?.metadata?.timer) {
          config.metadata.timer();
        }
        
        logger.apiError(
          config?.method?.toUpperCase() || 'UNKNOWN',
          config?.url || 'Unknown URL',
          error
        );
        
        if (error.response?.status === 401) {
          // Токен недействителен, удаляем его и перенаправляем на страницу входа
          localStorage.removeItem(getStorageKey('TOKEN'));
          logger.warn('AUTH', 'Token removed due to 401 response');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Аутентификация
  setToken(token: string): void {
    localStorage.setItem(getStorageKey('TOKEN'), token);
  }

  getToken(): string | null {
    return localStorage.getItem(getStorageKey('TOKEN'));
  }

  clearToken(): void {
    localStorage.removeItem(getStorageKey('TOKEN'));
  }

  // Проверка токена
  async checkToken(): Promise<{ isValid: boolean; error?: string }> {
    try {
      const response = await this.api.get('/health/token/');
      return { isValid: true };
    } catch (error: any) {
      let errorMessage = 'Unknown error';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        isValid: false, 
        error: errorMessage 
      };
    }
  }

  // Общая информация о кофейне
  async getCoffeeShopInfo(): Promise<any> {
    const response = await this.api.get('/coffee-shop/info/');
    return response.data;
  }

  // === КАТЕГОРИИ ===
  async getCategories(): Promise<Category[]> {
    const response = await this.api.get('/categories/');
    return response.data;
  }

  async createCategory(name: string): Promise<Category> {
    const response = await this.api.post('/categories/', { name });
    return response.data;
  }

  async updateCategory(id: string, name: string): Promise<Category> {
    const response = await this.api.put(`/categories/${id}/`, { name });
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.api.delete(`/categories/${id}/`);
  }

  // === ПРОДУКТЫ ===
  async getProducts(): Promise<Product[]> {
    const response = await this.api.get('/products/');
    return response.data;
  }

  async getOnlineShopProducts(): Promise<Product[]> {
    const response = await this.api.get('/products/online-shop/');
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.api.get(`/products/${id}/`);
    return response.data;
  }

  async createProduct(product: ProductCreate): Promise<Product> {
    const response = await this.api.post('/products/', product);
    return response.data;
  }

  async updateProduct(id: string, product: Partial<ProductCreate>): Promise<Product> {
    const response = await this.api.put(`/products/${id}/`, product);
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.api.delete(`/products/${id}/`);
  }

  // === ЗАКАЗЫ ===
  async getOrders(): Promise<Order[]> {
    const response = await this.api.get('/orders/');
    return response.data;
  }

  async getOrder(id: string): Promise<Order> {
    const response = await this.api.get(`/orders/${id}/`);
    return response.data;
  }

  async createOrder(order: OrderCreate): Promise<Order> {
    const response = await this.api.post('/orders/', order);
    return response.data;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const response = await this.api.patch(`/orders/status-update/${id}/`, { status });
    return response.data;
  }

  async getShiftOrders(shiftId: string): Promise<Order[]> {
    const response = await this.api.get(`/orders/shift-orders/${shiftId}/`);
    return response.data;
  }

  async getWaitingShiftOrders(shiftId: string): Promise<Order[]> {
    const response = await this.api.get(`/orders/waiting-shift-orders/${shiftId}/`);
    return response.data;
  }

  // === СМЕНЫ ===
  async getShifts(): Promise<Shift[]> {
    const response = await this.api.get('/shifts/');
    return response.data;
  }

  async getActiveShifts(): Promise<Shift[]> {
    const response = await this.api.get('/shifts/active-shifts/');
    return response.data;
  }

  async startShift(shiftId: string): Promise<Shift> {
    const response = await this.api.patch(`/shifts/shift-start-update/${shiftId}/`);
    return response.data;
  }

  async endShift(shiftId: string): Promise<Shift> {
    const response = await this.api.patch(`/shifts/shift-end-update/${shiftId}/`);
    return response.data;
  }

  // === СОТРУДНИКИ ===
  async getEmployees(): Promise<Employee[]> {
    const response = await this.api.get('/employees/');
    return response.data;
  }

  async getAvailableEmployees(): Promise<Employee[]> {
    const response = await this.api.get('/employees/available/');
    return response.data;
  }

  async createEmployee(name: string): Promise<Employee> {
    const response = await this.api.post('/employees/', { name });
    return response.data;
  }

  // === СКЛАДСКИЕ ТОВАРЫ ===
  async getItems(): Promise<Item[]> {
    const response = await this.api.get('/items/');
    return response.data;
  }

  async createItem(item: { name: string; measure: string }): Promise<Item> {
    const response = await this.api.post('/items/', item);
    return response.data;
  }

  // === ПОСТАВЩИКИ ===
  async getSuppliers(): Promise<Supplier[]> {
    const response = await this.api.get('/suppliers/');
    return response.data;
  }

  async createSupplier(name: string): Promise<Supplier> {
    const response = await this.api.post('/suppliers/', { name });
    return response.data;
  }

  // === ПОСТАВКИ ===
  async getSupplies(): Promise<Supply[]> {
    const response = await this.api.get('/supplies/');
    return response.data;
  }

  async createSupply(supply: { date: string; supplier_id: string }): Promise<Supply> {
    const response = await this.api.post('/supplies/', supply);
    return response.data;
  }

  // === КЛИЕНТЫ ===
  async getClients(): Promise<any[]> {
    const response = await this.api.get('/clients/');
    return response.data;
  }

  // === АНАЛИТИКА (базовые вычисления на клиенте) ===
  async getAnalyticsData(): Promise<any> {
    try {
      const [orders, products] = await Promise.all([
        this.getOrders(),
        this.getProducts()
      ]);

      // Вычисляем аналитику на основе полученных данных
      const completedOrders = orders.filter(order => order.status === OrderStatus.COMPLETED);
      const totalRevenue = completedOrders.reduce((sum, order) => sum + parseFloat(order.price), 0);
      const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

      // Группируем заказы по дням
      const dailyRevenue = this.groupOrdersByDay(completedOrders);

      // Топ продукты (базовая имитация, так как нужна более сложная логика)
      const topProducts = products.slice(0, 5).map(product => ({
        product_name: product.name,
        total_quantity: Math.floor(Math.random() * 100), // Имитация
        total_revenue: parseFloat(product.price) * Math.floor(Math.random() * 100)
      }));

      return {
        totalRevenue,
        totalOrders: completedOrders.length,
        averageOrderValue,
        topProducts,
        dailyRevenue
      };
    } catch (error) {
      console.error('Error getting analytics data:', error);
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
}

export const apiService = new ApiService(); 
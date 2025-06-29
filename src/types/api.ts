// Основные типы для работы с API кофейни

export interface AuthToken {
  token: string;
}

// Product types
export interface Category {
  id: string;
  name: string;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  online_shop: boolean;
  category: Category;
  image_url?: string;
}

export interface ProductCreate {
  name: string;
  category_id: string;
  price: number | string;
  online_shop: boolean;
  image_url?: string;
}

// Order types
export enum OrderPaymentMethod {
  CASH = 'cash',
  CARD = 'card'
}

export enum OrderType {
  DINE_IN = 'dine_in',
  DELIVERY = 'delivery',
  TAKEOUT = 'takeout'
}

export enum OrderStatus {
  WAITING = 'waiting',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RETURNED = 'returned'
}

export interface ProductOrder {
  product_id: string;
  count: number;
}

export interface Order {
  id: string;
  price: string;
  discount: string;
  date: string;
  payment_method: OrderPaymentMethod;
  type: OrderType;
  status: OrderStatus;
  shift_id: string;
  client_id?: string;
  active: boolean;
  order_number: number;
  products?: ProductOrderDetails[];
}

export interface ProductOrderDetails {
  product_order_id: string;
  count: number;
  product_id: string;
  product_name: string;
  product_price: string;
}

export interface OrderCreate {
  price: number | string;
  discount: number | string;
  date: string;
  payment_method: OrderPaymentMethod;
  type: OrderType;
  status: OrderStatus;
  shift_id: string;
  products: ProductOrder[];
}

// Shift types
export interface Shift {
  id: string;
  active: boolean;
  start_time?: string;
  end_time?: string;
}

// Employee types
export enum EmployeePosition {
  BARISTA = 'barista',
  MANAGER = 'manager'
}

export interface Employee {
  id: string;
  name?: string;
  position?: EmployeePosition;
  deactivated: boolean;
}

// Inventory types
export interface Item {
  id: string;
  name: string;
  measurement: string;
  active: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  deactivated: boolean;
}

export interface Supply {
  id: string;
  date: string;
  supplier_id: string;
  active: boolean;
}

// Store Item types
export interface StoreItem {
  id: string;
  item_id: string;
  item_name: string;
  supply_id: string | null;
  amount: string;
  price_per_item: string;
  debit: boolean;
  reporting_period_id: string;
  date: string;
  supplier: string;
}

export interface StoreItemCreate {
  item_id: string;
  supply_id?: string | null;
  amount: number | string;
  price_per_item: number | string;
}

export interface StoreItemCalculation {
  item_id: string;
  item_name: string;
  amount: string;
}

export interface ReportingPeriod {
  id: string;
  name?: string;
  start_time: string;
  end_time: string | null;
  status?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

// Analytics types
export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    product_name: string;
    total_quantity: number;
    total_revenue: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
} 
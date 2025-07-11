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
export const OrderPaymentMethod = {
  CASH: 'cash',
  CARD: 'card'
} as const;

export type OrderPaymentMethod = typeof OrderPaymentMethod[keyof typeof OrderPaymentMethod];

export const OrderType = {
  DINE_IN: 'dine_in',
  DELIVERY: 'delivery',
  TAKEAWAY: 'takeaway'
} as const;

export type OrderType = typeof OrderType[keyof typeof OrderType];

export const OrderStatus = {
  WAITING: 'waiting',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

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
export const EmployeePosition = {
  BARISTA: 'barista',
  MANAGER: 'manager'
} as const;

export type EmployeePosition = typeof EmployeePosition[keyof typeof EmployeePosition];

export interface Employee {
  id: string;
  name?: string;
  position?: EmployeePosition;
  deactivated: boolean;
}

// Inventory types
export const ItemMeasurements = {
  KG: 'kg',
  G: 'g',
  L: 'l',
  ML: 'ml',
  PCS: 'pcs'
} as const;

export type ItemMeasurements = typeof ItemMeasurements[keyof typeof ItemMeasurements];

export interface Item {
  id: string;
  name: string;
  measurement: ItemMeasurements;
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
  item_name: string | null;
  supply_id: string | null;
  amount: string;
  price_per_item: string | null;
  debit: boolean;
  shift_id: string;
  date: string;
  supplier: string | null;
}

export interface StoreItemCreate {
  item_id: string;
  supply_id?: string | null;
  amount: number | string;
  price_per_item?: number | string | null;
}

export interface StoreItemCalculation {
  item_id: string;
  item_name: string;
  amount: string;
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

// API константы
export interface ConstantItem {
  key: string;
  value: string;
}

// Аналитика активной смены
export interface ActiveShiftReport {
  shift_income: number;
  order_amount: number;
  total_product_amount: number;
  products_amount: Record<string, number>;
  product_price: Record<string, number>;
}

// Детальный отчет по смене
export interface OrdersReport {
  total_income: number;
  total_number_sold_products: number;
  total_number_orders: number;
  average_bill: number;
  debit_true_products_sum_json: ProductSummary[];
  debit_true_categories_sum_json: CategorySummary[];
  debit_true_unique_orders_json: OrderSummary[];
  debit_false_products_sum_json: ProductSummary[];
  debit_false_categories_sum_json: CategorySummary[];
  debit_false_unique_orders_json: OrderSummary[];
}

export interface ProductSummary {
  product_name: string;
  count: number;
  total_product_price: number;
}

export interface CategorySummary {
  product_category: string;
  count: number;
  total_product_price: number;
}

export interface OrderSummary {
  order_id: string;
  order_date: string;
  order_price: number;
  order_discount: number;
  order_payment_method: string;
  order_type: string;
  order_status: string;
} 
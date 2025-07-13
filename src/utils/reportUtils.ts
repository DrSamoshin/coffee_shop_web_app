import type { ProductSummary } from '../types/api';
import { TIME_INTERVALS } from '../config/chartConstants';

// Formatting utilities
export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatPrice = (amount: number): string => {
  if (isNaN(amount)) return '0,00';
  return new Intl.NumberFormat('ru-RU', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(amount).replace('.', ',');
};

export const formatDateOnly = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

// Time interval utilities
export const createTimeKey = (hour: number, intervalIndex: number): string => {
  return `${hour.toString().padStart(2, '0')}:${(intervalIndex * TIME_INTERVALS.MINUTES_PER_INTERVAL).toString().padStart(2, '0')}`;
};

export const getTimeKeyFromDate = (date: Date): string => {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const intervalIndex = Math.floor(minute / TIME_INTERVALS.MINUTES_PER_INTERVAL);
  return createTimeKey(hour, intervalIndex);
};

export const generateAllTimeKeys = (): string[] => {
  const timeKeys: string[] = [];
  for (let hour = 0; hour < TIME_INTERVALS.HOURS_PER_DAY; hour++) {
    for (let interval = 0; interval < TIME_INTERVALS.INTERVALS_PER_HOUR; interval++) {
      timeKeys.push(createTimeKey(hour, interval));
    }
  }
  return timeKeys;
};

// Category utilities
export const processCategoryQuantities = (products: ProductSummary[]) => {
  const totalQuantity = products.reduce((sum, product) => sum + product.count, 0);
  
  const categoryQuantities = products.reduce((acc, product) => {
    const category = product.product_category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += product.count;
    return acc;
  }, {} as Record<string, number>);

  const categoryKeys = Object.keys(categoryQuantities).map(cat => 
    cat.toLowerCase().replace(/\s+/g, '_')
  );

  return {
    totalQuantity,
    categoryQuantities,
    categoryKeys
  };
};

// Tooltip formatter utilities
export const createTooltipFormatter = (
  formatFn: (value: number) => string,
  nameTransformer?: (name: string) => string
) => {
  return (value: number | string, name: string) => [
    formatFn(Number(value)),
    nameTransformer ? nameTransformer(name) : String(name).replace(/_/g, ' ')
  ];
};

// Chart data validation
export const isValidChartData = <T>(data: T[] | null | undefined): data is T[] => {
  return Array.isArray(data) && data.length > 0;
}; 
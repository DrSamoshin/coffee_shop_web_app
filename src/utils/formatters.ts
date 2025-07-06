import { BUSINESS } from '../config/constants';

/**
 * Утилиты для форматирования данных
 * Следует принципу Single Responsibility
 */

/**
 * Форматирует валюту согласно локали и настройкам
 */
export const formatCurrency = (amount: number, locale: string = 'ru-RU'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: BUSINESS.CURRENCY === 'BYN' ? 'BYN' : 'USD'
  }).format(amount);
};

/**
 * Форматирует дату
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Форматирует числа с разделителями тысяч
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ru-RU').format(num);
};

/**
 * Обрезает текст до определенной длины
 */
export const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}; 
// Утилитные функции для работы с числами
export const formatNumber = (value: string | number, decimals: number = 2): string => {
  const num = typeof value === 'string' ? parseFloat(value.toString().replace(',', '.')) : value;
  if (isNaN(num)) return '0,00';
  return new Intl.NumberFormat('ru-RU', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  }).format(num).replace('.', ',');
};

export const parseNumberInput = (value: string): number => {
  return parseFloat(value.replace(',', '.')) || 0;
};

export const formatPrice = (value: string | number): string => {
  return formatNumber(value, 2);
}; 
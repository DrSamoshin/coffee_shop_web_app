import { useMemo } from 'react';
import type { OrderSummary } from '../types/api';

export interface TimeIntervalData {
  total: number;
  dine_in: number;
  takeaway: number;
  delivery: number;
}

export interface CategoryIntervalData {
  count: number;
  totalPrice: number;
}

// Hook for creating 20-minute time intervals data
export const useTimeIntervals = (orders: OrderSummary[]) => {
  return useMemo(() => {
    if (!orders || orders.length === 0) return [];

    // Group orders by 20-minute intervals
    const intervalData = orders.reduce((acc, order) => {
      const date = new Date(order.order_date);
      const hour = date.getHours();
      const minute = date.getMinutes();
      const intervalIndex = Math.floor(minute / 20); // 0, 1, 2 for 0-19, 20-39, 40-59
      const timeKey = `${hour.toString().padStart(2, '0')}:${(intervalIndex * 20).toString().padStart(2, '0')}`;
      
      if (!acc[timeKey]) {
        acc[timeKey] = {
          total: 0,
          dine_in: 0,
          takeaway: 0,
          delivery: 0
        };
      }
      
      acc[timeKey].total += 1;
      
      // Group by order types
      const orderType = order.order_type?.toLowerCase() || 'unknown';
      if (orderType === 'dine-in' || orderType === 'dine_in') {
        acc[timeKey].dine_in += 1;
      } else if (orderType === 'takeaway' || orderType === 'take_away') {
        acc[timeKey].takeaway += 1;
      } else if (orderType === 'delivery') {
        acc[timeKey].delivery += 1;
      }
      
      return acc;
    }, {} as Record<string, TimeIntervalData>);

    // Create data for all 20-minute intervals in 24 hours (72 intervals)
    const chartData = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let interval = 0; interval < 3; interval++) {
        const timeKey = `${hour.toString().padStart(2, '0')}:${(interval * 20).toString().padStart(2, '0')}`;
        const data = intervalData[timeKey] || { total: 0, dine_in: 0, takeaway: 0, delivery: 0 };
        chartData.push({
          time: timeKey,
          ...data
        });
      }
    }

    return chartData;
  }, [orders]);
};

// Hook for category-based time intervals
export const useCategoryTimeIntervals = (orders: OrderSummary[]) => {
  return useMemo(() => {
    if (!orders || orders.length === 0) return {};

    return orders.reduce((acc, order) => {
      const date = new Date(order.order_date);
      const hour = date.getHours();
      const minute = date.getMinutes();
      const intervalIndex = Math.floor(minute / 20);
      const timeKey = `${hour.toString().padStart(2, '0')}:${(intervalIndex * 20).toString().padStart(2, '0')}`;
      
      if (!acc[timeKey]) {
        acc[timeKey] = {
          count: 0,
          totalPrice: 0
        };
      }
      acc[timeKey].count += 1;
      acc[timeKey].totalPrice += parseFloat(order.order_price);
      
      return acc;
    }, {} as Record<string, CategoryIntervalData>);
  }, [orders]);
}; 
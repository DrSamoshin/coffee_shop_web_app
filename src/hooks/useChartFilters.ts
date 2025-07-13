import { useState, useCallback } from 'react';

// Generic hook for managing chart filters
export const useChartFilters = <T extends Record<string, boolean>>(
  initialFilters: T
) => {
  const [filters, setFilters] = useState<T>(initialFilters);

  const toggleFilter = useCallback((key: keyof T) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const resetFilters = useCallback((newFilters: T) => {
    setFilters(newFilters);
  }, []);

  const setAllFilters = useCallback((enabled: boolean) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      Object.keys(newFilters).forEach(key => {
        newFilters[key as keyof T] = enabled as T[keyof T];
      });
      return newFilters;
    });
  }, []);

  return {
    filters,
    toggleFilter,
    resetFilters,
    setAllFilters
  };
};

// Specialized hook for order type filters
export const useOrderTypeFilters = () => {
  return useChartFilters({
    dine_in: false,
    takeaway: false,
    delivery: false
  });
};

// Specialized hook for category filters
export const useCategoryFilters = () => {
  return useChartFilters<Record<string, boolean>>({});
}; 
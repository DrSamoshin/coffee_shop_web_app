import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { logger } from '../services/logger';

interface Constants {
  paymentMethods: string[];
  orderTypes: string[];
  orderStatuses: string[];
  employeePositions: string[];
  itemMeasurements: string[];
}

const initialConstants: Constants = {
  paymentMethods: ['cash', 'card'],
  orderTypes: ['dine_in', 'delivery', 'takeaway'],
  orderStatuses: ['waiting', 'completed', 'cancelled'],
  employeePositions: ['barista', 'manager'],
  itemMeasurements: ['kg', 'g', 'l', 'ml', 'pcs']
};

export const useConstants = () => {
  const [constants, setConstants] = useState<Constants>(initialConstants);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConstants = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [
        paymentMethods,
        orderTypes,
        orderStatuses,
        employeePositions,
        itemMeasurements
      ] = await Promise.all([
        apiService.getPaymentMethods(),
        apiService.getOrderTypes(),
        apiService.getOrderStatuses(),
        apiService.getEmployeePositions(),
        apiService.getItemMeasurements()
      ]);

      setConstants({
        paymentMethods,
        orderTypes,
        orderStatuses,
        employeePositions,
        itemMeasurements
      });
    } catch (err) {
      setError('Failed to load constants');
      logger.error('useConstants', 'Failed to load constants', err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConstants();
  }, []);

  return {
    constants,
    loading,
    error,
    reload: loadConstants
  };
}; 
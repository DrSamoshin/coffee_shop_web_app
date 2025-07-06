import { useState, useEffect, useCallback } from 'react';
import { logger } from '../services/logger';

export interface DataLoaderState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Универсальный хук для загрузки данных
 * Следует принципам Single Responsibility и DRY
 */
export function useDataLoader<T>(
  loadFunction: () => Promise<T[]>,
  componentName: string,
  dependencies: unknown[] = []
): DataLoaderState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      logger.debug(componentName, 'Loading data started');
      const result = await loadFunction();
      
      setData(result);
      logger.info(componentName, 'Data loaded successfully', { 
        count: result.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error(componentName, 'Failed to load data', 
        err instanceof Error ? err : new Error(errorMessage)
      );
    } finally {
      setLoading(false);
    }
  }, [loadFunction, componentName]);

  useEffect(() => {
    reload();
  }, dependencies);

  return { data, loading, error, reload };
} 
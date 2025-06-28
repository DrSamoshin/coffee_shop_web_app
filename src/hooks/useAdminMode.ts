import { isAdminMode } from '../config';

/**
 * Hook for checking admin mode status
 * Returns true if admin mode is enabled in environment variables
 */
export const useAdminMode = (): boolean => {
  return isAdminMode();
};

/**
 * Hook for conditional rendering based on admin mode
 * Returns component only if admin mode is enabled
 */
export const useAdminOnly = <T>(component: T): T | null => {
  const adminMode = useAdminMode();
  return adminMode ? component : null;
};

export default useAdminMode; 
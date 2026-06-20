import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard.api';

export const useDashboard = () => {
  const useStats = () => {
    return useQuery({
      queryKey: ['dashboardStats'],
      queryFn: () => dashboardApi.getStats(),
      refetchInterval: 10000, // Refetch every 10s
    });
  };

  return {
    useStats,
  };
};
export default useDashboard;

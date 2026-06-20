import api from '@/lib/api';

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityName?: string;
  userName?: string;
  userRole?: string;
  createdAt: string;
}

export interface DashboardStats {
  kpis: {
    totalProducts: number;
    totalUsers: number;
    salesOrders: number;
    purchaseOrders: number;
    manufacturingOrders: number;
    lowStockCount: number;
  };
  lowStockProducts: {
    id: string;
    name: string;
    sku: string;
    onHandQuantity: string | number;
    minStockLevel: string | number;
    unitOfMeasure: string;
  }[];
  recentActivity: AuditLog[];
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get<{ data: DashboardStats }>('/dashboard/stats');
    return res.data.data;
  },
};

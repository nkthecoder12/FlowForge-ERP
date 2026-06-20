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
    totalSalesOrders: number;
    pendingSalesOrders: number;
    shortageOrders: number;
    lowStockCount: number;
    totalInventoryValue: number;
  };
  inventoryHealth: {
    healthy: number;
    lowStock: number;
    critical: number;
    total: number;
  };
  lowStockProducts: {
    id: string;
    name: string;
    sku: string;
    onHandQuantity: number;
    reservedQuantity: number;
    freeQuantity: number;
    minStockLevel: number;
    unitOfMeasure: string;
    isLowStock: boolean;
  }[];
  recentActivity: AuditLog[];
  recentSalesOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }[];
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get<{ data: DashboardStats }>('/dashboard/stats');
    return res.data.data;
  },
};

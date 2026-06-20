import prisma from '@/lib/server/db';

export class DashboardService {
  async getStats() {
    const [
      totalProducts,
      totalUsers,
      salesOrdersCount,
      purchaseOrdersCount,
      manufacturingOrdersCount,
      lowStockProducts,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.salesOrder.count(),
      prisma.purchaseOrder.count(),
      prisma.manufacturingOrder.count(),
      prisma.product.findMany({
        where: {
          isActive: true,
          AND: [{ minStockLevel: { gt: 0 } }],
        },
        select: {
          id: true,
          name: true,
          sku: true,
          onHandQuantity: true,
          minStockLevel: true,
          unitOfMeasure: true,
        },
        orderBy: { onHandQuantity: 'asc' },
        take: 10,
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          action: true,
          entityType: true,
          entityName: true,
          userName: true,
          userRole: true,
          createdAt: true,
        },
      }),
    ]);

    const actualLowStock = lowStockProducts.filter(
      (p) => Number(p.onHandQuantity) <= Number(p.minStockLevel),
    );

    return {
      kpis: {
        totalProducts,
        totalUsers,
        salesOrders: salesOrdersCount,
        purchaseOrders: purchaseOrdersCount,
        manufacturingOrders: manufacturingOrdersCount,
        lowStockCount: actualLowStock.length,
      },
      lowStockProducts: actualLowStock,
      recentActivity: recentAuditLogs,
    };
  }
}

export const dashboardService = new DashboardService();

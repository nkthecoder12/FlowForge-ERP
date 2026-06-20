import prisma from '@/lib/server/db';

export class DashboardService {
  async getStats() {
    const [
      totalProducts,
      totalSalesOrders,
      pendingSalesOrdersCount,
      shortageOrdersCount,
      products,
      recentAuditLogs,
      recentSalesOrders,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.salesOrder.count(),
      prisma.salesOrder.count({
        where: { status: { in: ['draft', 'confirmed', 'shortage_detected', 'ready'] } },
      }),
      prisma.salesOrder.count({ where: { status: 'shortage_detected' } }),
      prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          sku: true,
          onHandQuantity: true,
          reservedQuantity: true,
          minStockLevel: true,
          costPrice: true,
          unitOfMeasure: true,
        },
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
      prisma.salesOrder.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          status: true,
          totalAmount: true,
          createdAt: true,
        },
      }),
    ]);

    let totalInventoryValue = 0;
    let healthyCount = 0;
    let lowStockCount = 0;
    let criticalCount = 0;

    const lowStockProducts = products
      .map((p) => {
        const onHand = Number(p.onHandQuantity);
        const reserved = Number(p.reservedQuantity);
        const freeQty = onHand - reserved;
        const minStock = Number(p.minStockLevel);
        const costPrice = Number(p.costPrice);

        totalInventoryValue += onHand * costPrice;

        if (freeQty <= 0) criticalCount++;
        else if (freeQty <= minStock) lowStockCount++;
        else healthyCount++;

        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          onHandQuantity: onHand,
          reservedQuantity: reserved,
          freeQuantity: freeQty,
          minStockLevel: minStock,
          unitOfMeasure: p.unitOfMeasure,
          isLowStock: freeQty <= minStock,
        };
      })
      .filter((p) => p.isLowStock);

    return {
      kpis: {
        totalProducts,
        totalSalesOrders,
        pendingSalesOrders: pendingSalesOrdersCount,
        shortageOrders: shortageOrdersCount,
        lowStockCount: lowStockProducts.length,
        totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
      },
      inventoryHealth: {
        healthy: healthyCount,
        lowStock: lowStockCount,
        critical: criticalCount,
        total: products.length,
      },
      lowStockProducts: lowStockProducts.slice(0, 10),
      recentActivity: recentAuditLogs,
      recentSalesOrders,
    };
  }
}

export const dashboardService = new DashboardService();

import prisma from '@/lib/server/db';
import { createAuditLog } from '@/lib/server/utils/auditLog';
import type { UserRole, MovementType } from '@prisma/client';

export class InventoryService {
  async list() {
    return prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async adjustStock(
    params: {
      productId: string;
      quantity: number;
      notes?: string;
    },
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const { productId, quantity, notes } = params;

    if (quantity === 0) {
      throw Object.assign(new Error('Adjustment quantity cannot be zero'), { statusCode: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }

    const direction = quantity > 0 ? 1 : -1;
    const absQty = Math.abs(quantity);

    const onHandBefore = Number(product.onHandQuantity);
    const onHandAfter = onHandBefore + quantity;

    if (onHandAfter < 0) {
      throw Object.assign(new Error('Stock levels cannot drop below zero'), { statusCode: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          onHandQuantity: onHandAfter,
        },
      });

      // 2. Log stock movement
      const movement = await tx.inventoryMovement.create({
        data: {
          productId,
          movementType: 'stock_adjustment',
          quantity: absQty,
          direction,
          quantityBefore: onHandBefore,
          quantityAfter: onHandAfter,
          notes: notes || 'Manual adjustment',
          createdBy: actorId,
        },
      });

      return { product: updatedProduct, movement };
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'stock_adjusted',
      entityType: 'product',
      entityId: productId,
      entityName: product.name,
      oldValues: { onHandQuantity: onHandBefore },
      newValues: { onHandQuantity: onHandAfter, notes },
    });

    return result;
  }

  async movementsLedger(productId?: string) {
    const where: Record<string, any> = {};
    if (productId) {
      where.productId = productId;
    }

    return prisma.inventoryMovement.findMany({
      where,
      include: {
        product: true,
        creator: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const inventoryService = new InventoryService();

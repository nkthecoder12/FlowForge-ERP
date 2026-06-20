import prisma from '@/lib/server/db';
import { createAuditLog } from '@/lib/server/utils/auditLog';
import type { UserRole } from '@prisma/client';

export class InventoryService {
  async list(role?: string) {
    const where: Record<string, any> = { isActive: true };
    if (role === 'sales') {
      where.productType = 'finished_good';
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return products.map((p) => {
      const onHand = Number(p.onHandQuantity);
      const reserved = Number(p.reservedQuantity);
      return {
        ...p,
        freeQuantity: onHand - reserved,
        isLowStock: onHand - reserved <= Number(p.minStockLevel),
      };
    });
  }

  async adjustStock(
    params: { productId: string; quantity: number; notes?: string },
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
    const reservedBefore = Number(product.reservedQuantity);

    if (onHandAfter < 0) {
      throw Object.assign(new Error('Stock levels cannot drop below zero'), { statusCode: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { onHandQuantity: onHandAfter },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          productId,
          movementType: 'stock_adjustment',
          quantity: absQty,
          direction,
          quantityBefore: onHandBefore,
          quantityAfter: onHandAfter,
          reservedBefore,
          reservedAfter: reservedBefore,
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

  async reserveStock(
    params: {
      productId: string;
      quantity: number;
      referenceSoId?: string;
      notes?: string;
    },
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const { productId, quantity, referenceSoId, notes } = params;

    if (quantity <= 0) {
      throw Object.assign(new Error('Reservation quantity must be positive'), { statusCode: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }

    const onHand = Number(product.onHandQuantity);
    const reserved = Number(product.reservedQuantity);
    const free = onHand - reserved;

    if (free < quantity) {
      throw Object.assign(
        new Error(`Insufficient free stock. Available: ${free}, Requested: ${quantity}`),
        { statusCode: 400 },
      );
    }

    const newReserved = reserved + quantity;

    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { reservedQuantity: newReserved },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          productId,
          movementType: 'stock_reservation',
          quantity,
          direction: -1,
          quantityBefore: onHand,
          quantityAfter: onHand,
          reservedBefore: reserved,
          reservedAfter: newReserved,
          referenceSoId: referenceSoId || null,
          notes: notes || 'Manual stock reservation',
          createdBy: actorId,
        },
      });

      return { product: updatedProduct, movement };
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'stock_reserved',
      entityType: 'product',
      entityId: productId,
      entityName: product.name,
      newValues: { quantityReserved: quantity, referenceSoId },
    });

    return result;
  }

  async releaseStock(
    params: {
      productId: string;
      quantity: number;
      referenceSoId?: string;
      notes?: string;
    },
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const { productId, quantity, referenceSoId, notes } = params;

    if (quantity <= 0) {
      throw Object.assign(new Error('Release quantity must be positive'), { statusCode: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }

    const onHand = Number(product.onHandQuantity);
    const reserved = Number(product.reservedQuantity);

    if (reserved < quantity) {
      throw Object.assign(
        new Error(`Cannot release more than reserved. Reserved: ${reserved}, Requested: ${quantity}`),
        { statusCode: 400 },
      );
    }

    const newReserved = reserved - quantity;

    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { reservedQuantity: newReserved },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          productId,
          movementType: 'stock_release',
          quantity,
          direction: 1,
          quantityBefore: onHand,
          quantityAfter: onHand,
          reservedBefore: reserved,
          reservedAfter: newReserved,
          referenceSoId: referenceSoId || null,
          notes: notes || 'Manual stock release',
          createdBy: actorId,
        },
      });

      return { product: updatedProduct, movement };
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'stock_reservation_released',
      entityType: 'product',
      entityId: productId,
      entityName: product.name,
      newValues: { quantityReleased: quantity, referenceSoId },
    });

    return result;
  }

  async movementsLedger(productId?: string) {
    const where: Record<string, string> = {};
    if (productId) where.productId = productId;

    return prisma.inventoryMovement.findMany({
      where,
      include: {
        product: true,
        creator: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const inventoryService = new InventoryService();

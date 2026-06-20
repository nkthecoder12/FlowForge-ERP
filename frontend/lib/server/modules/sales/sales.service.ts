import prisma from '@/lib/server/db';
import { createAuditLog } from '@/lib/server/utils/auditLog';
import { bomsService } from '../boms/boms.service';
import type { UserRole, SalesOrderStatus } from '@prisma/client';
import type { CreateSalesOrderInput } from './sales.validation';

export class SalesService {
  async list() {
    return prisma.salesOrder.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        creator: {
          select: { name: true }
        }
      },
    });

    if (!order) {
      throw Object.assign(new Error('Sales Order not found'), { statusCode: 404 });
    }

    return order;
  }

  async create(
    dto: CreateSalesOrderInput,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const totalAmount = dto.items.reduce((sum, item) => sum + item.quantityOrdered * item.unitPrice, 0);

    const order = await prisma.$transaction(async (tx) => {
      // 1. Create order header
      const createdOrder = await tx.salesOrder.create({
        data: {
          orderNumber: '',
          customerName: dto.customerName,
          customerEmail: dto.customerEmail || null,
          customerPhone: dto.customerPhone || null,
          notes: dto.notes || '',
          totalAmount,
          status: 'draft',
          createdBy: actorId,
        },
      });

      // 2. Create order line items
      await Promise.all(
        dto.items.map((item) =>
          tx.salesOrderItem.create({
            data: {
              salesOrderId: createdOrder.id,
              productId: item.productId,
              quantityOrdered: item.quantityOrdered,
              unitPrice: item.unitPrice,
            },
          })
        )
      );

      return createdOrder;
    });

    const fullOrder = await this.getById(order.id);

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'sales_order_created',
      entityType: 'sales_order',
      entityId: order.id,
      entityName: order.orderNumber,
      newValues: JSON.parse(JSON.stringify(fullOrder)),
    });

    return fullOrder;
  }

  async confirm(
    id: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw Object.assign(new Error('Sales Order not found'), { statusCode: 404 });
    }

    if (order.status !== 'draft' && order.status !== 'shortage_detected') {
      throw Object.assign(new Error('Only draft or shortage-detected orders can be confirmed'), { statusCode: 400 });
    }

    // 1. Perform stock availability check
    let allStockAvailable = true;
    const shortagesList: any[] = [];

    for (const item of order.items) {
      const onHand = Number(item.product.onHandQuantity);
      const reserved = Number(item.product.reservedQuantity);
      const freeQty = Math.max(0, onHand - reserved);
      const ordered = Number(item.quantityOrdered);

      if (freeQty < ordered) {
        allStockAvailable = false;
        const shortage = ordered - freeQty;

        // Run BoM explosion for components shortage
        const bomExplosion = await bomsService.explode(item.productId, shortage);
        
        shortagesList.push({
          productId: item.productId,
          productName: item.product.name,
          sku: item.product.sku,
          ordered,
          available: freeQty,
          shortage,
          hasBom: bomExplosion.hasBom,
          bomName: bomExplosion.bomName,
          materialsNeeded: bomExplosion.materials,
        });
      }
    }

    // 2. Process stock reservations or flag shortages inside a Transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (allStockAvailable) {
        // Reserve stock for all items
        for (const item of order.items) {
          const ordered = Number(item.quantityOrdered);

          // Update reserved quantity on product
          await tx.product.update({
            where: { id: item.productId },
            data: {
              reservedQuantity: {
                increment: ordered,
              },
            },
          });

          // Create stock reservation ledger record
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          const onHand = Number(product?.onHandQuantity || 0);

          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              movementType: 'stock_reservation',
              quantity: ordered,
              direction: -1, // reservation acts as outbound reduction of free stock
              quantityBefore: onHand,
              quantityAfter: onHand, // reservation does not change physical count
              referenceSoId: order.id,
              notes: `Reserved for Sales Order ${order.orderNumber}`,
              createdBy: actorId,
            },
          });
        }

        // Set status to ready
        return tx.salesOrder.update({
          where: { id },
          data: {
            status: 'ready',
            confirmedBy: actorId,
            confirmedAt: new Date(),
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      } else {
        // Format Shortage Analysis report text and save to notes
        const analysisReport = {
          checkedAt: new Date().toISOString(),
          shortages: shortagesList,
        };

        // Append to notes
        const originalNotes = order.notes || '';
        const delimiter = '\n\n[Shortage Analysis]\n';
        const cleanedNotes = originalNotes.split(delimiter)[0];
        const newNotes = cleanedNotes + delimiter + JSON.stringify(analysisReport, null, 2);

        return tx.salesOrder.update({
          where: { id },
          data: {
            status: 'shortage_detected',
            notes: newNotes,
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      }
    });

    // 3. Log Audits
    if (allStockAvailable) {
      await createAuditLog({
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        action: 'sales_order_confirmed',
        entityType: 'sales_order',
        entityId: id,
        entityName: order.orderNumber,
        newValues: { status: 'ready' },
      });
    } else {
      await createAuditLog({
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        action: 'sales_order_confirmed', // We will log confirmation action
        entityType: 'sales_order',
        entityId: id,
        entityName: order.orderNumber,
        newValues: { status: 'shortage_detected', shortages: shortagesList },
      });
    }

    return updatedOrder;
  }

  async deliver(
    id: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw Object.assign(new Error('Sales Order not found'), { statusCode: 404 });
    }

    if (order.status !== 'ready') {
      throw Object.assign(new Error('Only orders in READY state can be delivered'), { statusCode: 400 });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const ordered = Number(item.quantityOrdered);
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        const onHand = Number(product?.onHandQuantity || 0);
        const reserved = Number(product?.reservedQuantity || 0);

        if (onHand < ordered) {
          throw new Error(`Insufficient physical stock to deliver product ${item.product.name}. Required: ${ordered}, On hand: ${onHand}`);
        }

        // Decrement physical stock and release reservation
        const newOnHand = onHand - ordered;
        const newReserved = Math.max(0, reserved - ordered);

        await tx.product.update({
          where: { id: item.productId },
          data: {
            onHandQuantity: newOnHand,
            reservedQuantity: newReserved,
          },
        });

        // Create outbound delivery movement
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            movementType: 'sales_delivery',
            quantity: ordered,
            direction: -1,
            quantityBefore: onHand,
            quantityAfter: newOnHand,
            referenceSoId: order.id,
            notes: `Delivery for Sales Order ${order.orderNumber}`,
            createdBy: actorId,
          },
        });
      }

      return tx.salesOrder.update({
        where: { id },
        data: {
          status: 'delivered',
          deliveredBy: actorId,
          deliveredAt: new Date(),
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'sales_order_delivered',
      entityType: 'sales_order',
      entityId: id,
      entityName: order.orderNumber,
      newValues: { status: 'delivered' },
    });

    return updatedOrder;
  }
}

export const salesService = new SalesService();

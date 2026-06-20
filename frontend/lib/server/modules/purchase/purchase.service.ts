import prisma from '@/lib/server/db';
import { createAuditLog } from '@/lib/server/utils/auditLog';
import { generatePurchaseOrderNumber } from '../manufacturing/manufacturing.service';
import type { UserRole } from '@prisma/client';

export class PurchaseService {
  async list() {
    return prisma.purchaseOrder.findMany({
      include: {
        items: {
          include: { product: true },
        },
        triggeredBySo: true,
        creator: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        triggeredBySo: true,
        creator: { select: { name: true } },
      },
    });

    if (!po) {
      throw Object.assign(new Error('Purchase Order not found'), { statusCode: 404 });
    }

    return po;
  }

  async selectQuotation(
    poId: string,
    payload: { vendorName: string; vendorEmail?: string; vendorPhone?: string; totalAmount: number },
    actorId: string,
    actorName: string,
    actorRole: UserRole
  ) {
    const po = await this.getById(poId);

    if (po.status !== 'draft') {
      throw Object.assign(new Error('Can only select vendor quotation for draft requests'), {
        statusCode: 400,
      });
    }

    const updatedPo = await prisma.purchaseOrder.update({
      where: { id: poId },
      data: {
        vendorName: payload.vendorName,
        vendorEmail: payload.vendorEmail || null,
        vendorPhone: payload.vendorPhone || null,
        totalAmount: payload.totalAmount,
        notes: `${po.notes || ''}\n\nVendor quotation selected: ${payload.vendorName}. Total cost: INR ${payload.totalAmount.toLocaleString()}`,
      },
      include: {
        items: { include: { product: true } },
        triggeredBySo: true,
      },
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'purchase_order_created', // using existing purchase_order_created action for changes
      entityType: 'purchase_order',
      entityId: po.id,
      entityName: po.orderNumber,
      newValues: {
        vendorName: payload.vendorName,
        totalAmount: payload.totalAmount,
      },
    });

    return updatedPo;
  }

  async confirmPO(
    poId: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole
  ) {
    const po = await this.getById(poId);

    if (po.status !== 'draft') {
      throw Object.assign(new Error('Only draft purchase orders can be confirmed'), {
        statusCode: 400,
      });
    }

    if (!po.vendorName || po.vendorName.includes('Recommended Vendor')) {
      throw Object.assign(new Error('Please select a valid vendor quote before confirming the PO'), {
        statusCode: 400,
      });
    }

    const updatedPo = await prisma.purchaseOrder.update({
      where: { id: poId },
      data: {
        status: 'confirmed',
        confirmedBy: actorId,
        confirmedAt: new Date(),
        notes: `${po.notes || ''}\n\nPurchase Order confirmed and dispatched to supplier. Delivery pending tracking.`,
      },
      include: {
        items: { include: { product: true } },
        triggeredBySo: true,
      },
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'purchase_order_confirmed',
      entityType: 'purchase_order',
      entityId: po.id,
      entityName: po.orderNumber,
      newValues: {
        status: 'confirmed',
      },
    });

    return updatedPo;
  }

  async receiveMaterials(
    poId: string,
    payload: { checkResult: 'approve' | 'reject'; reason?: string },
    actorId: string,
    actorName: string,
    actorRole: UserRole
  ) {
    const po = await this.getById(poId);

    if (po.status !== 'confirmed') {
      throw Object.assign(new Error('Only confirmed purchase orders in-transit can be verified'), {
        statusCode: 400,
      });
    }

    if (payload.checkResult === 'approve') {
      const updatedPo = await prisma.$transaction(async (tx) => {
        // Increment on-hand quantity for raw materials
        for (const item of po.items) {
          const qty = Number(item.quantityOrdered);
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) continue;

          const onHand = Number(product.onHandQuantity);
          const newOnHand = onHand + qty;

          await tx.product.update({
            where: { id: item.productId },
            data: { onHandQuantity: newOnHand },
          });

          // Create inventory movement
          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              movementType: 'purchase_receipt',
              quantity: qty,
              direction: 1,
              quantityBefore: onHand,
              quantityAfter: newOnHand,
              referencePoId: po.id,
              notes: `Received materials for Purchase Order ${po.orderNumber}`,
              createdBy: actorId,
            },
          });
        }

        return tx.purchaseOrder.update({
          where: { id: poId },
          data: {
            status: 'received',
            receivedBy: actorId,
            receivedAt: new Date(),
            notes: `${po.notes || ''}\n\nIncoming receipt verified and approved. Materials added to inventory.`,
          },
          include: {
            items: { include: { product: true } },
            triggeredBySo: true,
          },
        });
      });

      await createAuditLog({
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        action: 'purchase_order_received',
        entityType: 'purchase_order',
        entityId: po.id,
        entityName: po.orderNumber,
        newValues: {
          status: 'received',
        },
      });

      // Update related Manufacturing Orders triggered by the same Sales Order
      if (po.triggeredBySoId) {
        const waitingMOs = await prisma.manufacturingOrder.findMany({
          where: {
            triggeredBySoId: po.triggeredBySoId,
            status: 'confirmed',
          },
        });

        for (const mo of waitingMOs) {
          await prisma.manufacturingOrder.update({
            where: { id: mo.id },
            data: {
              notes: `${mo.notes || ''}\n\n[Receipt Notification] Raw materials received under PO ${po.orderNumber}. Ready for manufacturing start.`,
            },
          });
        }
      }

      return updatedPo;
    } else {
      // Reject incoming receipt
      const updatedPo = await prisma.purchaseOrder.update({
        where: { id: poId },
        data: {
          status: 'cancelled',
          notes: `${po.notes || ''}\n\n[Receipt Verification REJECTED] Reason: ${payload.reason || 'Not specified'}. PO cancelled.`,
        },
        include: {
          items: { include: { product: true } },
          triggeredBySo: true,
        },
      });

      await createAuditLog({
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        action: 'purchase_order_cancelled',
        entityType: 'purchase_order',
        entityId: po.id,
        entityName: po.orderNumber,
        newValues: {
          status: 'cancelled',
          rejectionReason: payload.reason,
        },
      });

      return updatedPo;
    }
  }
}

export const purchaseService = new PurchaseService();

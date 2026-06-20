import prisma from '@/lib/server/db';
import { createAuditLog } from '@/lib/server/utils/auditLog';
import { bomsService } from '../boms/boms.service';
import type { UserRole, Prisma } from '@prisma/client';

type TransactionClient = Prisma.TransactionClient;

export async function generateManufacturingOrderNumber(tx: TransactionClient): Promise<string> {
  const latest = await tx.manufacturingOrder.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { orderNumber: true },
  });

  if (!latest?.orderNumber) {
    return 'MO-001';
  }

  const match = latest.orderNumber.match(/MO-(\d+)/);
  const nextNum = match ? parseInt(match[1], 10) + 1 : 1;
  return `MO-${String(nextNum).padStart(3, '0')}`;
}

export async function generatePurchaseOrderNumber(tx: TransactionClient): Promise<string> {
  const latest = await tx.purchaseOrder.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { orderNumber: true },
  });

  if (!latest?.orderNumber) {
    return 'PO-001';
  }

  const match = latest.orderNumber.match(/PO-(\d+)/);
  const nextNum = match ? parseInt(match[1], 10) + 1 : 1;
  return `PO-${String(nextNum).padStart(3, '0')}`;
}

export class ManufacturingService {
  private async mapMoStatus(mo: any) {
    if (!mo || mo.status !== 'confirmed') {
      return mo;
    }

    const bomExplosion = await bomsService.explode(mo.productId, Number(mo.quantityToProduce));
    if (!bomExplosion.hasBom) {
      return mo;
    }

    const hasShortages = bomExplosion.materials.some((mat) => mat.shortage > 0);
    return {
      ...mo,
      status: hasShortages ? 'WAITING_FOR_PROCUREMENT' : 'READY_TO_START',
    };
  }

  async list() {
    const mos = await prisma.manufacturingOrder.findMany({
      include: {
        product: true,
        bom: {
          include: {
            items: {
              include: { component: true },
            },
          },
        },
        triggeredBySo: true,
        creator: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(mos.map(mo => this.mapMoStatus(mo)));
  }

  async getById(id: string) {
    const mo = await prisma.manufacturingOrder.findUnique({
      where: { id },
      include: {
        product: true,
        bom: {
          include: {
            items: {
              include: { component: true },
            },
          },
        },
        triggeredBySo: true,
        creator: { select: { name: true } },
      },
    });

    if (!mo) {
      throw Object.assign(new Error('Manufacturing Order not found'), { statusCode: 404 });
    }

    return this.mapMoStatus(mo);
  }

  async createFromSalesOrder(
    salesOrderId: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole
  ) {
    const so = await prisma.salesOrder.findUnique({
      where: { id: salesOrderId },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!so) {
      throw Object.assign(new Error('Sales Order not found'), { statusCode: 404 });
    }

    // Get shortage analysis
    const getShortages = () => {
      if (!so.notes) return [];
      const delimiter = '\n\n[Shortage Analysis]\n';
      const parts = so.notes.split(delimiter);
      if (parts.length < 2) return [];
      try {
        const parsed = JSON.parse(parts[1]);
        return parsed.shortages || [];
      } catch {
        return [];
      }
    };

    const shortages = getShortages();
    if (shortages.length === 0) {
      // Re-calculate shortages on the fly if analysis notes don't exist
      for (const item of so.items) {
        const onHand = Number(item.product.onHandQuantity);
        const reserved = Number(item.product.reservedQuantity);
        const free = Math.max(0, onHand - reserved);
        const ordered = Number(item.quantityOrdered);
        if (free < ordered) {
          shortages.push({
            productId: item.productId,
            productName: item.product.name,
            sku: item.product.sku,
            shortage: ordered - free,
          });
        }
      }
    }

    if (shortages.length === 0) {
      throw Object.assign(new Error('No product shortages found to request manufacturing'), {
        statusCode: 400,
      });
    }

    const createdMOs = [];

    for (const sh of shortages) {
      // Find active BOM for the product
      const bom = await prisma.bom.findFirst({
        where: { productId: sh.productId, isActive: true },
      });

      if (!bom) {
        console.warn(`No active BOM found for product ${sh.productName} (${sh.productId}). Skipping MO creation.`);
        continue;
      }

      // Check if MO already exists for this SO and product
      const existingMO = await prisma.manufacturingOrder.findFirst({
        where: {
          triggeredBySoId: salesOrderId,
          productId: sh.productId,
          status: { in: ['draft', 'confirmed', 'in_progress'] },
        },
      });

      if (existingMO) {
        createdMOs.push(existingMO);
        continue;
      }

      const mo = await prisma.$transaction(async (tx) => {
        const orderNumber = await generateManufacturingOrderNumber(tx);
        return tx.manufacturingOrder.create({
          data: {
            orderNumber,
            productId: sh.productId,
            bomId: bom.id,
            quantityToProduce: sh.shortage,
            status: 'draft',
            triggeredBySoId: salesOrderId,
            createdBy: actorId,
            notes: `Production request generated automatically for shortage on Sales Order ${so.orderNumber}.`,
          },
        });
      });

      const fullMo = await this.getById(mo.id);
      await createAuditLog({
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        action: 'manufacturing_order_created',
        entityType: 'manufacturing_order',
        entityId: mo.id,
        entityName: mo.orderNumber,
        newValues: JSON.parse(JSON.stringify(fullMo)),
      });

      createdMOs.push(fullMo);
    }

    return createdMOs;
  }

  async approve(
    moId: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole
  ) {
    const mo = await this.getById(moId);

    if (mo.status !== 'draft') {
      throw Object.assign(new Error('Only draft manufacturing orders can be approved'), {
        statusCode: 400,
      });
    }

    // Explode components
    const bomExplosion = await bomsService.explode(mo.productId, Number(mo.quantityToProduce));
    if (!bomExplosion.hasBom) {
      throw Object.assign(new Error('No active BoM recipe found to explode components'), {
        statusCode: 400,
      });
    }

    const missingMaterials = bomExplosion.materials.filter((mat) => mat.shortage > 0);
    const hasShortages = missingMaterials.length > 0;

    let updatedMo = mo;

    if (hasShortages) {
      // Create draft Purchase Order automatically
      const po = await prisma.$transaction(async (tx) => {
        const poNumber = await generatePurchaseOrderNumber(tx);

        // Recommend vendor based on category of first missing material
        const firstMat = missingMaterials[0];
        const category = firstMat ? await tx.product.findUnique({ where: { id: firstMat.componentId }, select: { category: true } }) : null;
        let recommendedVendor = 'Apex Fasteners Corp';
        if (category?.category === 'Timber' || firstMat.product.toLowerCase().includes('wood')) {
          recommendedVendor = 'Global Timber Ltd';
        } else if (firstMat.product.toLowerCase().includes('finish') || firstMat.product.toLowerCase().includes('varnish')) {
          recommendedVendor = 'Rainbow Coatings';
        }

        const shortageDetailsText = missingMaterials.map(m => `- ${m.product}: Shortage ${m.shortage} (Required ${m.required}, Available ${m.available})`).join('\n');
        const poNotes = `[Procurement Request Metadata]
Manufacturing Order ID: ${mo.id}
Manufacturing Order Number: ${mo.orderNumber}
Sales Order ID: ${mo.triggeredBySoId || 'None'}
Sales Order Number: ${mo.triggeredBySo?.orderNumber || 'None'}
Finished Product Name: ${mo.product.name}
Required Materials:
${shortageDetailsText}
Priority: High
Status: WAITING_FOR_PROCUREMENT`;

        const createdPo = await tx.purchaseOrder.create({
          data: {
            orderNumber: poNumber,
            vendorName: recommendedVendor,
            vendorEmail: `${recommendedVendor.toLowerCase().replace(/\s/g, '')}@example.com`,
            vendorPhone: '+91 99999 88888',
            status: 'draft',
            triggeredBySoId: mo.triggeredBySoId,
            createdBy: actorId,
            notes: poNotes,
          },
        });

        for (const mat of missingMaterials) {
          const matProduct = await tx.product.findUnique({ where: { id: mat.componentId } });
          const reorderQty = matProduct ? Number(matProduct.reorderQuantity) : 0;
          // Order larger of missing amount or standard reorder amount
          const qtyToOrder = Math.max(mat.shortage, reorderQty);
          const costPrice = matProduct ? Number(matProduct.costPrice) : 0;

          await tx.purchaseOrderItem.create({
            data: {
              purchaseOrderId: createdPo.id,
              productId: mat.componentId,
              quantityOrdered: qtyToOrder,
              unitCost: costPrice,
            },
          });
        }

        const totalAmount = missingMaterials.reduce((sum, mat) => {
          const reorderQty = mat.required;
          return sum + reorderQty * 100;
        }, 0);

        return tx.purchaseOrder.update({
          where: { id: createdPo.id },
          data: {
            totalAmount: totalAmount,
          },
        });
      });

      // Update MO with PO reference in notes
      await prisma.manufacturingOrder.update({
        where: { id: moId },
        data: {
          status: 'confirmed',
          notes: `${mo.notes || ''}\n\n[Procurement Generated] Draft Purchase Order ${po.orderNumber} created for component shortages.`,
        },
      });
      updatedMo = await this.getById(moId);

      // Write parent Sales Order notes to update timeline trace
      if (mo.triggeredBySoId) {
        const so = await prisma.salesOrder.findUnique({ where: { id: mo.triggeredBySoId } });
        if (so) {
          await prisma.salesOrder.update({
            where: { id: mo.triggeredBySoId },
            data: {
              notes: `${so.notes || ''}\n\n[Shortage Detected] PM Approved MO ${mo.orderNumber}. Material shortages detected. Automatically generated Purchase Order ${po.orderNumber}.`,
            },
          });
        }
      }

      // Write Audit Log: Manufacturing Approved
      await createAuditLog({
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        action: 'bom_exploded',
        entityType: 'manufacturing_order',
        entityId: mo.id,
        entityName: `Manufacturing Approved: MO ${mo.orderNumber} approved by PM`,
        newValues: { action: 'approved', moId: mo.id, moNumber: mo.orderNumber },
      });

      // Write Audit Log: Raw Material Check Completed
      await createAuditLog({
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        action: 'bom_exploded',
        entityType: 'manufacturing_order',
        entityId: mo.id,
        entityName: `Raw Material Check Completed: BOM components requirement validated`,
        newValues: { moNumber: mo.orderNumber, requirements: bomExplosion.materials },
      });

      // Write Audit Log: Material Shortage Detected
      await createAuditLog({
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        action: 'shortage_detected',
        entityType: 'manufacturing_order',
        entityId: mo.id,
        entityName: `Material Shortage Detected: missing components for MO ${mo.orderNumber}`,
        newValues: { moNumber: mo.orderNumber, shortages: missingMaterials },
      });

      // Write Audit Log: Procurement Request Created
      await createAuditLog({
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        action: 'purchase_order_created',
        entityType: 'purchase_order',
        entityId: po.id,
        entityName: `Procurement Request Created: Draft PO ${po.orderNumber} generated`,
        newValues: { poId: po.id, poNumber: po.orderNumber, vendor: po.vendorName, items: missingMaterials },
      });
    } else {
      // All raw materials available
      await prisma.manufacturingOrder.update({
        where: { id: moId },
        data: {
          status: 'confirmed',
          notes: `${mo.notes || ''}\n\nAll raw materials verified and reserved. Ready for execution.`,
        },
      });
      updatedMo = await this.getById(moId);

      // Write parent Sales Order notes to update timeline trace
      if (mo.triggeredBySoId) {
        const so = await prisma.salesOrder.findUnique({ where: { id: mo.triggeredBySoId } });
        if (so) {
          await prisma.salesOrder.update({
            where: { id: mo.triggeredBySoId },
            data: {
              notes: `${so.notes || ''}\n\n[Manufacturing Ready] PM Approved MO ${mo.orderNumber}. All components available. Ready to start manufacturing.`,
            },
          });
        }
      }

      // Write Audit Log: Manufacturing Approved
      await createAuditLog({
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        action: 'bom_exploded',
        entityType: 'manufacturing_order',
        entityId: mo.id,
        entityName: `Manufacturing Approved: MO ${mo.orderNumber} approved by PM`,
        newValues: { action: 'approved', moId: mo.id, moNumber: mo.orderNumber },
      });

      // Write Audit Log: Raw Material Check Completed
      await createAuditLog({
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        action: 'bom_exploded',
        entityType: 'manufacturing_order',
        entityId: mo.id,
        entityName: `Raw Material Check Completed: BOM components requirement validated`,
        newValues: { moNumber: mo.orderNumber, requirements: bomExplosion.materials },
      });

      // Write Audit Log: Manufacturing Ready
      await createAuditLog({
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        action: 'bom_exploded',
        entityType: 'manufacturing_order',
        entityId: mo.id,
        entityName: `Manufacturing Ready: All components allocated. MO ${mo.orderNumber} ready to start`,
        newValues: { moNumber: mo.orderNumber, status: 'READY_TO_START' },
      });
    }

    return updatedMo;
  }


  async reject(
    moId: string,
    reason: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole
  ) {
    const mo = await this.getById(moId);

    if (mo.status !== 'draft') {
      throw Object.assign(new Error('Only draft manufacturing orders can be rejected'), {
        statusCode: 400,
      });
    }

    const updatedMo = await prisma.manufacturingOrder.update({
      where: { id: moId },
      data: {
        status: 'cancelled',
        notes: `${mo.notes || ''}\n\n[Rejection Reason] PM Rejected: ${reason}`,
      },
      include: {
        product: true,
        bom: true,
        triggeredBySo: true,
      },
    });

    // Create Audit Log
    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'manufacturing_order_cancelled',
      entityType: 'manufacturing_order',
      entityId: mo.id,
      entityName: mo.orderNumber,
      newValues: {
        reason,
        status: 'cancelled',
      },
    });

    // Also update parent Sales Order if applicable
    if (mo.triggeredBySoId) {
      await prisma.salesOrder.update({
        where: { id: mo.triggeredBySoId },
        data: {
          notes: `${mo.triggeredBySo?.notes || ''}\n\n[Production Rejected] Manufacturing ${mo.orderNumber} rejected by PM. Reason: ${reason}`,
        },
      });
    }

    return updatedMo;
  }

  async start(
    moId: string,
    machine: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole
  ) {
    const mo = await this.getById(moId);

    if (mo.status !== 'READY_TO_START') {
      throw Object.assign(new Error('Only ready-to-start manufacturing orders can be started'), {
        statusCode: 400,
      });
    }

    // Double check raw materials availability before starting
    const bomExplosion = await bomsService.explode(mo.productId, Number(mo.quantityToProduce));
    const missingMaterials = bomExplosion.materials.filter((mat) => mat.shortage > 0);
    if (missingMaterials.length > 0) {
      throw Object.assign(
        new Error(`Cannot start manufacturing. Missing raw materials: ${missingMaterials.map(m => m.product).join(', ')}`),
        { statusCode: 400 }
      );
    }

    const updatedMo = await prisma.$transaction(async (tx) => {
      // Consume raw materials
      for (const item of mo.bom.items) {
        const requiredQty = (Number(item.quantity) / Number(mo.bom.quantity)) * Number(mo.quantityToProduce);
        const comp = await tx.product.findUnique({ where: { id: item.componentId } });
        if (!comp) continue;

        const onHand = Number(comp.onHandQuantity);
        const newOnHand = Math.max(0, onHand - requiredQty);

        await tx.product.update({
          where: { id: item.componentId },
          data: { onHandQuantity: newOnHand },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: item.componentId,
            movementType: 'manufacturing_consume',
            quantity: requiredQty,
            direction: -1,
            quantityBefore: onHand,
            quantityAfter: newOnHand,
            referenceMoId: mo.id,
            notes: `Consumed for Manufacturing Order ${mo.orderNumber}`,
            createdBy: actorId,
          },
        });
      }

      return tx.manufacturingOrder.update({
        where: { id: moId },
        data: {
          status: 'in_progress',
          actualStart: new Date(),
          notes: `${mo.notes || ''}\n\nProduction started on Machine: ${machine}.`,
        },
        include: {
          product: true,
          bom: true,
          triggeredBySo: true,
        },
      });
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'manufacturing_order_started',
      entityType: 'manufacturing_order',
      entityId: mo.id,
      entityName: mo.orderNumber,
      newValues: {
        machine,
        status: 'in_progress',
      },
    });

    return updatedMo;
  }

  async complete(
    moId: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole
  ) {
    const mo = await this.getById(moId);

    if (mo.status !== 'in_progress') {
      throw Object.assign(new Error('Only in-progress manufacturing orders can be completed'), {
        statusCode: 400,
      });
    }

    const qtyProduced = Number(mo.quantityToProduce);

    const updatedMo = await prisma.$transaction(async (tx) => {
      // Increase finished good on-hand
      const fg = await tx.product.findUnique({ where: { id: mo.productId } });
      const onHand = Number(fg?.onHandQuantity || 0);
      const newOnHand = onHand + qtyProduced;

      await tx.product.update({
        where: { id: mo.productId },
        data: { onHandQuantity: newOnHand },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: mo.productId,
          movementType: 'manufacturing_produce',
          quantity: qtyProduced,
          direction: 1,
          quantityBefore: onHand,
          quantityAfter: newOnHand,
          referenceMoId: mo.id,
          notes: `Completed Manufacturing Order ${mo.orderNumber}`,
          createdBy: actorId,
        },
      });

      return tx.manufacturingOrder.update({
        where: { id: moId },
        data: {
          status: 'completed',
          actualEnd: new Date(),
          quantityProduced: qtyProduced,
        },
        include: {
          product: true,
          bom: true,
          triggeredBySo: true,
        },
      });
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'manufacturing_order_completed',
      entityType: 'manufacturing_order',
      entityId: mo.id,
      entityName: mo.orderNumber,
      newValues: {
        quantityProduced: qtyProduced,
        status: 'completed',
      },
    });

    // If triggered by sales order, recheck all sales order shortage issues
    if (mo.triggeredBySoId) {
      const so = await prisma.salesOrder.findUnique({
        where: { id: mo.triggeredBySoId },
        include: { items: { include: { product: true } } },
      });

      if (so) {
        let allSatisfied = true;
        const toReserveUpdates: Array<{
          productId: string;
          ordered: number;
          productName: string;
          currentReserved: number;
          currentOnHand: number;
        }> = [];

        for (const item of so.items) {
          const product = await prisma.product.findUnique({ where: { id: item.productId } });
          if (!product) continue;

          const currentOnHand = Number(product.onHandQuantity);
          const currentReserved = Number(product.reservedQuantity);
          const free = Math.max(0, currentOnHand - currentReserved);
          const ordered = Number(item.quantityOrdered);

          if (free < ordered) {
            allSatisfied = false;
          } else {
            toReserveUpdates.push({
              productId: item.productId,
              ordered,
              productName: product.name,
              currentReserved,
              currentOnHand,
            });
          }
        }

        if (allSatisfied && toReserveUpdates.length > 0) {
          await prisma.$transaction(async (tx) => {
            for (const res of toReserveUpdates) {
              const newReserved = res.currentReserved + res.ordered;

              await tx.product.update({
                where: { id: res.productId },
                data: { reservedQuantity: newReserved },
              });

              await tx.inventoryMovement.create({
                data: {
                  productId: res.productId,
                  movementType: 'stock_reservation',
                  quantity: res.ordered,
                  direction: -1,
                  quantityBefore: res.currentOnHand,
                  quantityAfter: res.currentOnHand,
                  reservedBefore: res.currentReserved,
                  reservedAfter: newReserved,
                  referenceSoId: so.id,
                  notes: `Reserved ${res.ordered} of newly completed stock for SO ${so.orderNumber}`,
                  createdBy: actorId,
                },
              });
            }

            await tx.salesOrder.update({
              where: { id: so.id },
              data: { status: 'ready' },
            });
          });

          await createAuditLog({
            userId: actorId,
            userName: actorName,
            userRole: actorRole,
            action: 'sales_order_confirmed',
            entityType: 'sales_order',
            entityId: so.id,
            entityName: so.orderNumber,
            newValues: {
              status: 'ready',
              notes: 'All items now fully reserved after manufacturing completed.',
            },
          });
        }
      }
    }

    return updatedMo;
  }
}

export const manufacturingService = new ManufacturingService();

import prisma from '@/lib/server/db';
import { createAuditLog } from '@/lib/server/utils/auditLog';
import type { UserRole, ProcurementType, ProcurementStrategy } from '@prisma/client';
import type { CreateProductInput, UpdateProductInput } from './products.validation';

export class ProductsService {
  async list(filters: {
    search?: string;
    category?: string;
    procurementType?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    productType?: 'raw_material' | 'finished_good';
  }) {
    const { search, category, procurementType, isActive = true, page = 1, limit = 20, productType } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, any> = { isActive };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (procurementType) where.procurementType = procurementType as ProcurementType;
    if (productType) where.productType = productType;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        bomHeaders: {
          where: { isActive: true },
          include: {
            items: {
              include: {
                component: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }

    return product;
  }

  async getBySku(sku: string) {
    const product = await prisma.product.findUnique({ where: { sku } });
    if (!product) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }
    return product;
  }

  async create(
    dto: CreateProductInput,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const existing = await prisma.product.findUnique({ where: { sku: dto.sku.toUpperCase() } });
    if (existing) {
      throw Object.assign(new Error('Product with this SKU already exists'), { statusCode: 409 });
    }

    const product = await prisma.product.create({
      data: {
        name: dto.name,
        sku: dto.sku.toUpperCase(),
        productType: dto.productType,
        description: dto.description,
        category: dto.category,
        unitOfMeasure: dto.unitOfMeasure,
        salesPrice: dto.salesPrice,
        costPrice: dto.costPrice,
        onHandQuantity: dto.onHandQuantity,
        reservedQuantity: dto.reservedQuantity,
        minStockLevel: dto.minStockLevel,
        reorderQuantity: dto.reorderQuantity,
        procurementType: dto.procurementType as ProcurementType,
        procurementStrategy: dto.procurementStrategy as ProcurementStrategy,
        isActive: dto.isActive,
        createdBy: actorId,
      },
    });

    // If initial stock is set, log stock movement
    if (dto.onHandQuantity > 0) {
      await prisma.inventoryMovement.create({
        data: {
          productId: product.id,
          movementType: 'stock_adjustment',
          quantity: dto.onHandQuantity,
          direction: 1,
          quantityBefore: 0,
          quantityAfter: dto.onHandQuantity,
          notes: 'Initial stock on product creation',
          createdBy: actorId,
        }
      });
    }

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'product_created',
      entityType: 'product',
      entityId: product.id,
      entityName: product.name,
      newValues: JSON.parse(JSON.stringify(product)),
    });

    return product;
  }

  async update(
    id: string,
    dto: UpdateProductInput,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }

    if (dto.sku && dto.sku.toUpperCase() !== existing.sku) {
      const other = await prisma.product.findUnique({ where: { sku: dto.sku.toUpperCase() } });
      if (other) {
        throw Object.assign(new Error('Product with this SKU already exists'), { statusCode: 409 });
      }
    }

    const data: Record<string, any> = {};
    if (dto.name) data.name = dto.name;
    if (dto.sku) data.sku = dto.sku.toUpperCase();
    if (dto.productType) data.productType = dto.productType;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.unitOfMeasure) data.unitOfMeasure = dto.unitOfMeasure;
    if (dto.salesPrice !== undefined) data.salesPrice = dto.salesPrice;
    if (dto.costPrice !== undefined) data.costPrice = dto.costPrice;
    if (dto.minStockLevel !== undefined) data.minStockLevel = dto.minStockLevel;
    if (dto.reorderQuantity !== undefined) data.reorderQuantity = dto.reorderQuantity;
    if (dto.procurementType) data.procurementType = dto.procurementType as ProcurementType;
    if (dto.procurementStrategy) data.procurementStrategy = dto.procurementStrategy as ProcurementStrategy;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'product_updated',
      entityType: 'product',
      entityId: product.id,
      entityName: product.name,
      oldValues: JSON.parse(JSON.stringify(existing)),
      newValues: JSON.parse(JSON.stringify(product)),
    });

    return product;
  }

  async delete(
    id: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }

    // Soft delete
    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'product_deleted',
      entityType: 'product',
      entityId: id,
      entityName: existing.name,
    });

    return { message: 'Product deleted successfully' };
  }
}

export const productsService = new ProductsService();

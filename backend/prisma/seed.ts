import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('🧹 Clearing existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.bomItem.deleteMany();
  await prisma.bom.deleteMany();
  await prisma.manufacturingOrder.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Seed Users
  console.log('👤 Seeding users...');
  await prisma.user.createMany({
    data: [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Super Admin',
        email: 'admin@shivfurniture.com',
        passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'admin'
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Ravi Sharma',
        email: 'ravi@shivfurniture.com',
        passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'product_manager'
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'Priya Singh',
        email: 'priya@shivfurniture.com',
        passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'sales'
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        name: 'Amit Patel',
        email: 'amit@shivfurniture.com',
        passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'purchase'
      },
      {
        id: '00000000-0000-0000-0000-000000000005',
        name: 'Neha Gupta',
        email: 'neha@shivfurniture.com',
        passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'inventory'
      }
    ]
  });

  // Seed Products - Finished Goods
  console.log('📦 Seeding finished goods...');
  await prisma.product.createMany({
    data: [
      {
        id: '10000000-0000-0000-0000-000000000001',
        name: 'Wooden Dining Table',
        sku: 'WDT-001',
        description: '6-seater solid wood dining table',
        category: 'Furniture',
        unitOfMeasure: 'pcs',
        salesPrice: 15000.00,
        costPrice: 8500.00,
        onHandQuantity: 5,
        minStockLevel: 10,
        reorderQuantity: 15,
        procurementType: 'manufacture',
        procurementStrategy: 'mts',
        createdBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        name: 'Wooden Chair',
        sku: 'WCH-001',
        description: 'Solid wood dining chair',
        category: 'Furniture',
        unitOfMeasure: 'pcs',
        salesPrice: 3500.00,
        costPrice: 1800.00,
        onHandQuantity: 20,
        minStockLevel: 20,
        reorderQuantity: 30,
        procurementType: 'manufacture',
        procurementStrategy: 'mts',
        createdBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        id: '10000000-0000-0000-0000-000000000003',
        name: 'Wooden Bookshelf',
        sku: 'WBS-001',
        description: '5-shelf solid wood bookshelf',
        category: 'Furniture',
        unitOfMeasure: 'pcs',
        salesPrice: 8000.00,
        costPrice: 4500.00,
        onHandQuantity: 8,
        minStockLevel: 5,
        reorderQuantity: 10,
        procurementType: 'manufacture',
        procurementStrategy: 'mto',
        createdBy: '00000000-0000-0000-0000-000000000002'
      }
    ]
  });

  // Seed Products - Raw Materials
  console.log('🔧 Seeding raw materials...');
  await prisma.product.createMany({
    data: [
      {
        id: '20000000-0000-0000-0000-000000000001',
        name: 'Wooden Leg (Table)',
        sku: 'RM-WL-001',
        description: 'Solid teak table leg, 75cm height',
        category: 'Raw Material',
        unitOfMeasure: 'pcs',
        costPrice: 250.00,
        onHandQuantity: 40,
        minStockLevel: 50,
        reorderQuantity: 100,
        procurementType: 'purchase',
        procurementStrategy: 'mts',
        createdBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        id: '20000000-0000-0000-0000-000000000002',
        name: 'Wooden Table Top',
        sku: 'RM-WT-001',
        description: 'Solid teak table top panel, 180x90cm',
        category: 'Raw Material',
        unitOfMeasure: 'pcs',
        costPrice: 1200.00,
        onHandQuantity: 12,
        minStockLevel: 10,
        reorderQuantity: 20,
        procurementType: 'purchase',
        procurementStrategy: 'mts',
        createdBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        id: '20000000-0000-0000-0000-000000000003',
        name: 'Wood Screws (Box)',
        sku: 'RM-SC-001',
        description: 'Box of 50 wood screws, 4x40mm',
        category: 'Raw Material',
        unitOfMeasure: 'box',
        costPrice: 120.00,
        onHandQuantity: 8,
        minStockLevel: 20,
        reorderQuantity: 30,
        procurementType: 'purchase',
        procurementStrategy: 'mts',
        createdBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        id: '20000000-0000-0000-0000-000000000004',
        name: 'Wooden Chair Leg',
        sku: 'RM-CL-001',
        description: 'Solid wood chair leg, 45cm',
        category: 'Raw Material',
        unitOfMeasure: 'pcs',
        costPrice: 150.00,
        onHandQuantity: 100,
        minStockLevel: 80,
        reorderQuantity: 100,
        procurementType: 'purchase',
        procurementStrategy: 'mts',
        createdBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        id: '20000000-0000-0000-0000-000000000005',
        name: 'Chair Seat Panel',
        sku: 'RM-CS-001',
        description: 'Solid wood chair seat panel, 45x45cm',
        category: 'Raw Material',
        unitOfMeasure: 'pcs',
        costPrice: 400.00,
        onHandQuantity: 30,
        minStockLevel: 20,
        reorderQuantity: 30,
        procurementType: 'purchase',
        procurementStrategy: 'mts',
        createdBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        id: '20000000-0000-0000-0000-000000000006',
        name: 'Chair Back Panel',
        sku: 'RM-CB-001',
        description: 'Solid wood chair back panel',
        category: 'Raw Material',
        unitOfMeasure: 'pcs',
        costPrice: 350.00,
        onHandQuantity: 25,
        minStockLevel: 20,
        reorderQuantity: 30,
        procurementType: 'purchase',
        procurementStrategy: 'mts',
        createdBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        id: '20000000-0000-0000-0000-000000000007',
        name: 'Shelf Board',
        sku: 'RM-SB-001',
        description: 'Solid wood shelf board, 80x30cm',
        category: 'Raw Material',
        unitOfMeasure: 'pcs',
        costPrice: 300.00,
        onHandQuantity: 20,
        minStockLevel: 15,
        reorderQuantity: 25,
        procurementType: 'purchase',
        procurementStrategy: 'mts',
        createdBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        id: '20000000-0000-0000-0000-000000000008',
        name: 'Vertical Side Panel',
        sku: 'RM-VP-001',
        description: 'Vertical side panel for bookshelf, 180x30cm',
        category: 'Raw Material',
        unitOfMeasure: 'pcs',
        costPrice: 600.00,
        onHandQuantity: 10,
        minStockLevel: 10,
        reorderQuantity: 15,
        procurementType: 'purchase',
        procurementStrategy: 'mts',
        createdBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        id: '20000000-0000-0000-0000-000000000009',
        name: 'Wood Finish (Litre)',
        sku: 'RM-WF-001',
        description: 'Teak wood finish varnish',
        category: 'Raw Material',
        unitOfMeasure: 'ltr',
        costPrice: 180.00,
        onHandQuantity: 15,
        minStockLevel: 10,
        reorderQuantity: 20,
        procurementType: 'purchase',
        procurementStrategy: 'mts',
        createdBy: '00000000-0000-0000-0000-000000000002'
      }
    ]
  });

  // Seed BOMs
  console.log('📋 Seeding BOMs...');
  await prisma.bom.createMany({
    data: [
      {
        id: '30000000-0000-0000-0000-000000000001',
        productId: '10000000-0000-0000-0000-000000000001',
        name: 'Wooden Dining Table - Standard BoM',
        quantity: 1,
        isActive: true,
        notes: 'Standard recipe for 6-seater dining table',
        createdBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        id: '30000000-0000-0000-0000-000000000002',
        productId: '10000000-0000-0000-0000-000000000002',
        name: 'Wooden Chair - Standard BoM',
        quantity: 1,
        isActive: true,
        notes: 'Standard recipe for dining chair',
        createdBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        id: '30000000-0000-0000-0000-000000000003',
        productId: '10000000-0000-0000-0000-000000000003',
        name: 'Wooden Bookshelf - Standard BoM',
        quantity: 1,
        isActive: true,
        notes: 'Standard recipe for 5-shelf bookshelf',
        createdBy: '00000000-0000-0000-0000-000000000002'
      }
    ]
  });

  // Seed BOM Items
  console.log('🔩 Seeding BOM items...');
  await prisma.bomItem.createMany({
    data: [
      // Wooden Dining Table BoM items
      {
        id: '40000000-0000-0000-0000-000000000001',
        bomId: '30000000-0000-0000-0000-000000000001',
        componentId: '20000000-0000-0000-0000-000000000001',
        quantity: 4,
        unitOfMeasure: 'pcs'
      },
      {
        id: '40000000-0000-0000-0000-000000000002',
        bomId: '30000000-0000-0000-0000-000000000001',
        componentId: '20000000-0000-0000-0000-000000000002',
        quantity: 1,
        unitOfMeasure: 'pcs'
      },
      {
        id: '40000000-0000-0000-0000-000000000003',
        bomId: '30000000-0000-0000-0000-000000000001',
        componentId: '20000000-0000-0000-0000-000000000003',
        quantity: 0.24,
        unitOfMeasure: 'box'
      },
      {
        id: '40000000-0000-0000-0000-000000000004',
        bomId: '30000000-0000-0000-0000-000000000001',
        componentId: '20000000-0000-0000-0000-000000000009',
        quantity: 0.5,
        unitOfMeasure: 'ltr'
      },
      // Wooden Chair BoM items
      {
        id: '40000000-0000-0000-0000-000000000005',
        bomId: '30000000-0000-0000-0000-000000000002',
        componentId: '20000000-0000-0000-0000-000000000004',
        quantity: 4,
        unitOfMeasure: 'pcs'
      },
      {
        id: '40000000-0000-0000-0000-000000000006',
        bomId: '30000000-0000-0000-0000-000000000002',
        componentId: '20000000-0000-0000-0000-000000000005',
        quantity: 1,
        unitOfMeasure: 'pcs'
      },
      {
        id: '40000000-0000-0000-0000-000000000007',
        bomId: '30000000-0000-0000-0000-000000000002',
        componentId: '20000000-0000-0000-0000-000000000006',
        quantity: 1,
        unitOfMeasure: 'pcs'
      },
      {
        id: '40000000-0000-0000-0000-000000000008',
        bomId: '30000000-0000-0000-0000-000000000002',
        componentId: '20000000-0000-0000-0000-000000000003',
        quantity: 0.12,
        unitOfMeasure: 'box'
      },
      {
        id: '40000000-0000-0000-0000-000000000009',
        bomId: '30000000-0000-0000-0000-000000000002',
        componentId: '20000000-0000-0000-0000-000000000009',
        quantity: 0.25,
        unitOfMeasure: 'ltr'
      },
      // Wooden Bookshelf BoM items
      {
        id: '40000000-0000-0000-0000-000000000010',
        bomId: '30000000-0000-0000-0000-000000000003',
        componentId: '20000000-0000-0000-0000-000000000007',
        quantity: 5,
        unitOfMeasure: 'pcs'
      },
      {
        id: '40000000-0000-0000-0000-000000000011',
        bomId: '30000000-0000-0000-0000-000000000003',
        componentId: '20000000-0000-0000-0000-000000000008',
        quantity: 2,
        unitOfMeasure: 'pcs'
      },
      {
        id: '40000000-0000-0000-0000-000000000012',
        bomId: '30000000-0000-0000-0000-000000000003',
        componentId: '20000000-0000-0000-0000-000000000003',
        quantity: 0.40,
        unitOfMeasure: 'box'
      },
      {
        id: '40000000-0000-0000-0000-000000000013',
        bomId: '30000000-0000-0000-0000-000000000003',
        componentId: '20000000-0000-0000-0000-000000000009',
        quantity: 0.75,
        unitOfMeasure: 'ltr'
      }
    ]
  });

  // Seed Audit Logs
  console.log('📝 Seeding audit logs...');
  await prisma.auditLog.createMany({
    data: [
      {
        userId: '00000000-0000-0000-0000-000000000002',
        userName: 'Ravi Sharma',
        userRole: 'product_manager',
        action: 'product_created',
        entityType: 'product',
        entityId: '10000000-0000-0000-0000-000000000001',
        entityName: 'Wooden Dining Table',
        newValues: { sku: 'WDT-001', procurement_type: 'manufacture' }
      },
      {
        userId: '00000000-0000-0000-0000-000000000002',
        userName: 'Ravi Sharma',
        userRole: 'product_manager',
        action: 'product_created',
        entityType: 'product',
        entityId: '10000000-0000-0000-0000-000000000002',
        entityName: 'Wooden Chair',
        newValues: { sku: 'WCH-001', procurement_type: 'manufacture' }
      },
      {
        userId: '00000000-0000-0000-0000-000000000002',
        userName: 'Ravi Sharma',
        userRole: 'product_manager',
        action: 'product_created',
        entityType: 'product',
        entityId: '10000000-0000-0000-0000-000000000003',
        entityName: 'Wooden Bookshelf',
        newValues: { sku: 'WBS-001', procurement_type: 'manufacture' }
      },
      {
        userId: '00000000-0000-0000-0000-000000000002',
        userName: 'Ravi Sharma',
        userRole: 'product_manager',
        action: 'bom_created',
        entityType: 'bom',
        entityId: '30000000-0000-0000-0000-000000000001',
        entityName: 'Wooden Dining Table - Standard BoM',
        newValues: { components: 4 }
      },
      {
        userId: '00000000-0000-0000-0000-000000000002',
        userName: 'Ravi Sharma',
        userRole: 'product_manager',
        action: 'bom_created',
        entityType: 'bom',
        entityId: '30000000-0000-0000-0000-000000000002',
        entityName: 'Wooden Chair - Standard BoM',
        newValues: { components: 5 }
      },
      {
        userId: '00000000-0000-0000-0000-000000000002',
        userName: 'Ravi Sharma',
        userRole: 'product_manager',
        action: 'bom_created',
        entityType: 'bom',
        entityId: '30000000-0000-0000-0000-000000000003',
        entityName: 'Wooden Bookshelf - Standard BoM',
        newValues: { components: 4 }
      }
    ]
  });

  console.log('✅ Seed completed successfully!');
  console.log('📊 Summary:');
  console.log('  - 5 users created');
  console.log('  - 12 products created (3 finished goods, 9 raw materials)');
  console.log('  - 3 BOMs created');
  console.log('  - 13 BOM items created');
  console.log('  - 6 audit logs created');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

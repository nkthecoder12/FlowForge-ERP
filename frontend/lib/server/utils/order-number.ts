import type { Prisma } from '@prisma/client';

type TransactionClient = Prisma.TransactionClient;

export async function generateSalesOrderNumber(tx: TransactionClient): Promise<string> {
  const latest = await tx.salesOrder.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { orderNumber: true },
  });

  if (!latest?.orderNumber) {
    return 'SO-001';
  }

  const match = latest.orderNumber.match(/SO-(\d+)/);
  const nextNum = match ? parseInt(match[1], 10) + 1 : 1;
  return `SO-${String(nextNum).padStart(3, '0')}`;
}

export async function generateManufacturingOrderNumber(tx: TransactionClient): Promise<string> {
  const latest = await tx.manufacturingOrder.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { orderNumber: true },
  });

  // Filter out blank/empty order numbers that may exist from previous bugs
  const lastValid = latest?.orderNumber?.match(/MO-(\d+)/)
    ? latest.orderNumber
    : null;

  if (!lastValid) {
    // Scan all to find the highest existing MO number
    const all = await tx.manufacturingOrder.findMany({
      select: { orderNumber: true },
    });
    const numbers = all
      .map((o) => { const m = o.orderNumber?.match(/MO-(\d+)/); return m ? parseInt(m[1], 10) : 0; })
      .filter((n) => n > 0);
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `MO-${String(maxNum + 1).padStart(3, '0')}`;
  }

  const match = lastValid.match(/MO-(\d+)/);
  const nextNum = match ? parseInt(match[1], 10) + 1 : 1;
  return `MO-${String(nextNum).padStart(3, '0')}`;
}

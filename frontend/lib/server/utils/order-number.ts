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

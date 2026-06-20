import { inventoryService } from '@/lib/server/modules/inventory/inventory.service';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import type { UserRole } from '@prisma/client';

export async function GET() {
  return handleRoute(async () => {
    const user = await requireRole('admin', 'inventory', 'product_manager', 'sales');
    if (isErrorResponse(user)) return user;

    const inventory = await inventoryService.list();
    return jsonSuccess(inventory, 'Inventory fetched successfully');
  });
}

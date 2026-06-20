import { purchaseService } from '@/lib/server/modules/purchase/purchase.service';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';

export async function GET() {
  return handleRoute(async () => {
    const user = await requireRole('admin', 'purchase', 'inventory');
    if (isErrorResponse(user)) return user;

    const orders = await purchaseService.list();
    return jsonSuccess(orders, 'Purchase orders fetched successfully');
  });
}

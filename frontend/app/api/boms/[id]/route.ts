import { bomsService } from '@/lib/server/modules/boms/boms.service';
import { requireAuth, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const user = await requireAuth();
    if (isErrorResponse(user)) return user;

    const { id } = await context.params;
    const result = await bomsService.getById(id);
    return jsonSuccess(result, 'BOM fetched successfully');
  });
}

import type { Request, Response, NextFunction } from 'express';
import { auditService } from './audit.service';
import { sendSuccess } from '../../utils/response';

export class AuditController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, action, entityType, startDate, endDate, page, limit } = req.query;
      const result = await auditService.list({
        userId: userId as string,
        action: action as string,
        entityType: entityType as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      sendSuccess(res, result, 'Audit logs fetched');
    } catch (err) {
      next(err);
    }
  }

  async getActions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actions = await auditService.getDistinctActions();
      sendSuccess(res, actions, 'Actions fetched');
    } catch (err) {
      next(err);
    }
  }
}

export const auditController = new AuditController();

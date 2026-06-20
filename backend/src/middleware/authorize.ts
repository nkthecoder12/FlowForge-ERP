import type { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

/**
 * Role-based authorization middleware.
 * Must be used AFTER the `authenticate` middleware.
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }

    next();
  };
};

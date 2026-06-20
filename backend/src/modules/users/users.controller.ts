import type { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { createUserSchema, updateUserSchema } from './users.validation';
import { sendSuccess, sendError } from '../../utils/response';
import type { UserRole } from '@prisma/client';

export class UsersController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, role, isActive, page, limit } = req.query;
      const result = await usersService.list({
        search: search as string,
        role: role as string,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      sendSuccess(res, result, 'Users fetched');
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.getById(req.params.id);
      sendSuccess(res, user, 'User fetched');
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createUserSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors);
        return;
      }
      const actor = req.user!;
      const user = await usersService.create(
        parsed.data,
        actor.sub,
        actor.email,
        actor.role as UserRole,
      );
      sendSuccess(res, user, 'User created', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = updateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors);
        return;
      }
      const actor = req.user!;
      const user = await usersService.update(
        req.params.id,
        parsed.data,
        actor.sub,
        actor.email,
        actor.role as UserRole,
      );
      sendSuccess(res, user, 'User updated');
    } catch (err) {
      next(err);
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = req.user!;
      const user = await usersService.toggleStatus(
        req.params.id,
        actor.sub,
        actor.email,
        actor.role as UserRole,
      );
      sendSuccess(res, user, `User ${user.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = req.user!;
      const result = await usersService.delete(
        req.params.id,
        actor.sub,
        actor.email,
        actor.role as UserRole,
      );
      sendSuccess(res, result, 'User deleted');
    } catch (err) {
      next(err);
    }
  }
}

export const usersController = new UsersController();

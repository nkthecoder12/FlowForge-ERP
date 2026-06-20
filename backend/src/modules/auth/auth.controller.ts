import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { loginSchema, registerSchema } from './auth.validation';
import { setAuthCookies, clearAuthCookies } from '../../utils/cookies';
import { sendSuccess, sendError } from '../../utils/response';

export class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors);
        return;
      }

      const result = await authService.register(parsed.data);

      setAuthCookies(res, result.accessToken, result.refreshToken, false);

      sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        'Registration successful',
        201,
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors);
        return;
      }

      const result = await authService.login(parsed.data);

      setAuthCookies(res, result.accessToken, result.refreshToken, parsed.data.rememberMe);

      sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        'Login successful',
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/refresh
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = (req.cookies?.refresh_token as string) || (req.body?.refreshToken as string);
      if (!token) {
        sendError(res, 'Refresh token missing', 401);
        return;
      }

      const { accessToken } = await authService.refresh(token);

      // Update the access token cookie
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 15 * 60 * 1000,
        path: '/',
      });

      sendSuccess(res, { accessToken }, 'Token refreshed');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      clearAuthCookies(res);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/auth/me
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const user = await authService.getMe(userId);
      sendSuccess(res, user, 'User profile fetched');
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();

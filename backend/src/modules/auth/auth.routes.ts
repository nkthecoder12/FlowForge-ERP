import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

/** POST /api/auth/login */
router.post('/login', authController.login.bind(authController));

router.post('/register', authController.register.bind(authController));

/** POST /api/auth/refresh */
router.post('/refresh', authController.refresh.bind(authController));

/** POST /api/auth/logout */
router.post('/logout', authController.logout.bind(authController));

/** GET /api/auth/me — protected */
router.get('/me', authenticate, authController.getMe.bind(authController));

export default router;

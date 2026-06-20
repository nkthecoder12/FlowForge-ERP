import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// All user management routes require authentication and admin role
router.use(authenticate, authorize('admin'));

router.get('/', usersController.list.bind(usersController));
router.get('/:id', usersController.getById.bind(usersController));
router.post('/', usersController.create.bind(usersController));
router.put('/:id', usersController.update.bind(usersController));
router.patch('/:id/toggle-status', usersController.toggleStatus.bind(usersController));
router.delete('/:id', usersController.remove.bind(usersController));

export default router;

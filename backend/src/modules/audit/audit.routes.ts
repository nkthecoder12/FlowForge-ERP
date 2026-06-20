import { Router } from 'express';
import { auditController } from './audit.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', auditController.list.bind(auditController));
router.get('/actions', auditController.getActions.bind(auditController));

export default router;

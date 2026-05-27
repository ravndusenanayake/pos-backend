import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

// All user management routes require Super Admin role
router.use(authenticateJWT, requireRole(['SUPER_ADMIN']));

router.get('/', (req, res) => userController.getUsers(req, res));
router.post('/cashiers', (req, res) => userController.createCashier(req, res));

export default router;

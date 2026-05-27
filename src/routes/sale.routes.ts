import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const saleController = new SaleController();

// All routes require authentication
router.use(authenticateJWT);

// GET sales history and POST checkout routes
router.get('/', requireRole(['SUPER_ADMIN']), (req, res) => saleController.getSales(req, res));
router.get('/stats', requireRole(['SUPER_ADMIN']), (req, res) => saleController.getStats(req, res));
router.post('/', (req, res) => saleController.createSale(req, res));

export default router;

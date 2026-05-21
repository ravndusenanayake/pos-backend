import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();
const saleController = new SaleController();

// All routes require authentication
router.use(authenticateJWT);

// GET sales history and POST checkout routes
router.get('/', (req, res) => saleController.getSales(req, res));
router.post('/', (req, res) => saleController.createSale(req, res));

export default router;

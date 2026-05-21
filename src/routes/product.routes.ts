import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const productController = new ProductController();

// All routes require authentication
router.use(authenticateJWT);

// GET routes (accessible to both Super Admin and Cashier)
router.get('/', (req, res) => productController.getProducts(req, res));
router.get('/:id', (req, res) => productController.getProductById(req, res));

// Write routes (restricted to Super Admin only)
router.post('/', requireRole(['SUPER_ADMIN']), (req, res) => productController.createProduct(req, res));
router.put('/:id', requireRole(['SUPER_ADMIN']), (req, res) => productController.updateProduct(req, res));
router.delete('/:id', requireRole(['SUPER_ADMIN']), (req, res) => productController.deleteProduct(req, res));

export default router;

import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const categoryController = new CategoryController();

// All routes require authentication
router.use(authenticateJWT);

// GET routes (accessible to both Super Admin and Cashier)
router.get('/', (req, res) => categoryController.getCategories(req, res));
router.get('/:id', (req, res) => categoryController.getCategoryById(req, res));

// Write routes (restricted to Super Admin only)
router.post('/', requireRole(['SUPER_ADMIN']), (req, res) => categoryController.createCategory(req, res));
router.put('/:id', requireRole(['SUPER_ADMIN']), (req, res) => categoryController.updateCategory(req, res));
router.delete('/:id', requireRole(['SUPER_ADMIN']), (req, res) => categoryController.deleteCategory(req, res));

export default router;

import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import saleRoutes from './sale.routes';
import userRoutes from './user.routes';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Mount API routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/sales', saleRoutes);
router.use('/users', userRoutes);

// Protected profile endpoint (requires active JWT)
router.get('/protected-profile', authenticateJWT, (req, res) => {
  res.json({
    message: 'You have successfully accessed a protected route.',
    user: req.user,
  });
});

// Super admin-only restricted endpoint
router.get('/admin-only', authenticateJWT, requireRole(['SUPER_ADMIN']), (req, res) => {
  res.json({
    message: 'Access granted. Welcome Super Admin!',
    user: req.user,
  });
});

export default router;

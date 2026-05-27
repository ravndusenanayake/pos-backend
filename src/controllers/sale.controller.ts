import { Request, Response } from 'express';
import { SaleService } from '../services/sale.service';

const saleService = new SaleService();

export class SaleController {
  /**
   * POST /api/sales
   * Process a checkout / transaction sale
   */
  async createSale(req: Request, res: Response): Promise<void> {
    try {
      const { cashier_id, payment_method, discount, items } = req.body;

      // Validate required inputs
      if (cashier_id === undefined || typeof cashier_id !== 'number' || isNaN(cashier_id)) {
        res.status(400).json({ error: 'Valid cashier_id is required' });
        return;
      }

      if (!payment_method || typeof payment_method !== 'string' || payment_method.trim() === '') {
        res.status(400).json({ error: 'Payment method is required and must be a non-empty string' });
        return;
      }

      if (discount !== undefined && (typeof discount !== 'number' || discount < 0)) {
        res.status(400).json({ error: 'Discount must be a non-negative number' });
        return;
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: 'Cart items are required and must be a non-empty array' });
        return;
      }

      // Validate item structures
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (
          !item ||
          item.product_id === undefined ||
          typeof item.product_id !== 'number' ||
          isNaN(item.product_id) ||
          item.qty === undefined ||
          typeof item.qty !== 'number' ||
          isNaN(item.qty) ||
          item.qty <= 0 ||
          !Number.isInteger(item.qty)
        ) {
          res.status(400).json({
            error: `Invalid cart item structure at index ${i}. Each item must have a valid product_id and a positive integer qty.`,
          });
          return;
        }
      }

      // Process transaction
      const sale = await saleService.createSale({
        cashier_id,
        payment_method: payment_method.trim(),
        discount,
        items,
      });

      res.status(201).json({
        message: 'Checkout successful',
        sale,
      });
    } catch (error: any) {
      console.error('Checkout error:', error);
      // Return clear validation/logical error messages
      res.status(400).json({ error: error.message || 'Error processing transaction' });
    }
  }

  /**
   * GET /api/sales
   * Retrieve sales history
   */
  async getSales(req: Request, res: Response): Promise<void> {
    try {
      const sales = await saleService.getSales();
      res.status(200).json(sales);
    } catch (error: any) {
      console.error('Error fetching sales history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  /**
   * GET /api/sales/stats
   * Retrieve dashboard KPI stats
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await saleService.getStats();
      res.status(200).json(stats);
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

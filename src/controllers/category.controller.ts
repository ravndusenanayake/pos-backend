import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';

const categoryService = new CategoryService();

export class CategoryController {
  /**
   * GET /api/categories
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await categoryService.getCategories();
      res.status(200).json(categories);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/categories/:id
   */
  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid category ID' });
        return;
      }

      const category = await categoryService.getCategoryById(id);
      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      res.status(200).json(category);
    } catch (error: any) {
      console.error('Error fetching category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/categories
   */
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name, status } = req.body;

      if (!name || typeof name !== 'string' || name.trim() === '') {
        res.status(400).json({ error: 'Category name is required and must be a non-empty string' });
        return;
      }

      const category = await categoryService.createCategory({
        name: name.trim(),
        status,
      });

      res.status(201).json(category);
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(400).json({ error: 'Category name already exists' });
      } else {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * PUT /api/categories/:id
   */
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid category ID' });
        return;
      }

      const { name, status } = req.body;

      if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
        res.status(400).json({ error: 'Category name must be a non-empty string' });
        return;
      }

      const updatedData: { name?: string; status?: boolean } = {};
      if (name !== undefined) updatedData.name = name.trim();
      if (status !== undefined) updatedData.status = !!status;

      const category = await categoryService.updateCategory(id, updatedData);
      res.status(200).json(category);
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Category not found' });
      } else if (error.code === 'P2002') {
        res.status(400).json({ error: 'Category name already exists' });
      } else {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * DELETE /api/categories/:id
   */
  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid category ID' });
        return;
      }

      await categoryService.deleteCategory(id);
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Category not found' });
      } else {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}

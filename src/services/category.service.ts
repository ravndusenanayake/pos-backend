import { prisma } from '../config/prisma';

export class CategoryService {
  /**
   * Retrieve all categories
   */
  async getCategories() {
    return prisma.category.findMany({
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Retrieve a single category by ID
   */
  async getCategoryById(id: number) {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new category
   */
  async createCategory(data: { name: string; status?: boolean }) {
    return prisma.category.create({
      data: {
        name: data.name,
        status: data.status !== undefined ? data.status : true,
      },
    });
  }

  /**
   * Update an existing category
   */
  async updateCategory(id: number, data: { name?: string; status?: boolean }) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: number) {
    return prisma.category.delete({
      where: { id },
    });
  }
}

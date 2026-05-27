import { prisma } from '../config/prisma';

export interface SaleItemInput {
  product_id: number;
  qty: number;
}

export interface CreateSaleInput {
  cashier_id: number;
  payment_method: string;
  discount?: number;
  items: SaleItemInput[];
}

export class SaleService {
  /**
   * Process a new sale checkout using a Prisma Transaction.
   * Ensures stock validation, subtotal/total calculation, and conditional stock decrementation.
   */
  async createSale(data: CreateSaleInput) {
    return prisma.$transaction(async (tx) => {
      // 1. Verify that the cashier exists
      const cashier = await tx.user.findUnique({
        where: { id: data.cashier_id },
      });
      if (!cashier) {
        throw new Error(`Cashier with ID ${data.cashier_id} does not exist`);
      }

      // 2. Validate that there are items in the cart
      if (!data.items || data.items.length === 0) {
        throw new Error('Cart must contain at least one item');
      }

      // 3. Extract product IDs and fetch products from database
      const productIds = data.items.map((item) => item.product_id);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      let subtotal = 0;
      const saleItemsToCreate: {
        product_id: number;
        qty: number;
        price: number;
        total: number;
      }[] = [];

      // 4. Validate each item in the cart
      for (const item of data.items) {
        const product = productMap.get(item.product_id);

        if (!product) {
          throw new Error(`Product with ID ${item.product_id} does not exist`);
        }

        if (!product.status) {
          throw new Error(`Product "${product.name}" is currently inactive`);
        }

        if (item.qty <= 0 || !Number.isInteger(item.qty)) {
          throw new Error(`Invalid quantity ${item.qty} for product "${product.name}"`);
        }

        // Validate stock for FINISHED products
        if (product.product_type === 'FINISHED') {
          if (product.quantity < item.qty) {
            throw new Error(`Insufficient stock for product "${product.name}". Available: ${product.quantity}, Requested: ${item.qty}`);
          }
        }

        // Calculate item pricing (price is Decimal)
        const priceNum = Number(product.price);
        const itemTotal = priceNum * item.qty;
        subtotal += itemTotal;

        saleItemsToCreate.push({
          product_id: item.product_id,
          qty: item.qty,
          price: priceNum,
          total: itemTotal,
        });
      }

      // 5. Calculate final total
      const discountAmount = data.discount !== undefined ? Math.max(0, data.discount) : 0;
      const total = Math.max(0, subtotal - discountAmount);

      // 6. Generate a unique invoice number: INV-YYYYMMDD-XXXX
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const invoice_no = `INV-${dateStr}-${randomSuffix}`;

      // 7. Create the main Sale record
      const sale = await tx.sale.create({
        data: {
          invoice_no,
          cashier_id: data.cashier_id,
          subtotal,
          discount: discountAmount,
          total,
          payment_method: data.payment_method,
        },
      });

      // 8. Create SaleItem records and update stock
      for (const item of saleItemsToCreate) {
        // Create SaleItem
        await tx.saleItem.create({
          data: {
            sale_id: sale.id,
            product_id: item.product_id,
            qty: item.qty,
            price: item.price,
            total: item.total,
          },
        });

        // Decrement stock only if FINISHED
        const product = productMap.get(item.product_id)!;
        if (product.product_type === 'FINISHED') {
          await tx.product.update({
            where: { id: item.product_id },
            data: {
              quantity: {
                decrement: item.qty,
              },
            },
          });
        }
      }

      // 9. Fetch the final nested sale object
      return tx.sale.findUnique({
        where: { id: sale.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          cashier: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });
  }

  /**
   * Retrieve sales history
   */
  async getSales() {
    return prisma.sale.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        cashier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Retrieve key statistics for the dashboard
   */
  async getStats() {
    // Today's date range (start of day to end of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Today's Sales Revenue
    const todaySales = await prisma.sale.aggregate({
      _sum: {
        total: true,
      },
      where: {
        created_at: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // 2. Total Orders (Count)
    const totalOrders = await prisma.sale.count();

    // 3. Total Products (Count)
    const totalProducts = await prisma.product.count({
      where: { status: true },
    });

    // 4. Total Cashiers (Count)
    const cashierRole = await prisma.role.findUnique({
      where: { name: 'CASHIER' },
    });
    
    let totalCashiers = 0;
    if (cashierRole) {
      totalCashiers = await prisma.user.count({
        where: { role_id: cashierRole.id },
      });
    }

    return {
      todaySales: todaySales._sum.total ? Number(todaySales._sum.total) : 0,
      totalOrders,
      totalProducts,
      totalCashiers,
    };
  }
}

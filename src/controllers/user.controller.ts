import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
  /**
   * GET /api/users
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getUsers();
      res.status(200).json(users);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/users/cashiers
   */
  async createCashier(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      if (!name || typeof name !== 'string' || name.trim() === '') {
        res.status(400).json({ error: 'Name is required' });
        return;
      }

      if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
        res.status(400).json({ error: 'Valid email is required' });
        return;
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long' });
        return;
      }

      const cashier = await userService.createCashier({ name, email, passwordRaw: password });
      res.status(201).json(cashier);
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        console.error('Error creating cashier:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}

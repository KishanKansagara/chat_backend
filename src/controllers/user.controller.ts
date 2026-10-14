import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { parsePositiveInteger } from '../utils/validation';

export class UserController {
  static async listChats(req: Request, res: Response): Promise<void> {
    const userId = parsePositiveInteger(req.params.userId, 'userId');
    const chats = await UserService.listChats(userId);
    res.status(200).json({ success: true, data: chats });
  }
}

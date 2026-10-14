import { Request, Response } from 'express';
import { ChatService } from '../services/chat.service';
import { parsePositiveInteger } from '../utils/validation';

export class ChatController {
  static async createOrGet(req: Request, res: Response): Promise<void> {
    const userAId = parsePositiveInteger(req.body.userAId, 'userAId');
    const userBId = parsePositiveInteger(req.body.userBId, 'userBId');
    const result = await ChatService.createOrGetDirectChat(userAId, userBId);
    res.status(result.created ? 201 : 200).json({
      success: true,
      message: result.created ? 'Chat created successfully' : 'Existing chat returned',
      data: { chatId: result.chat.id, type: result.chat.type, created: result.created }
    });
  }
}

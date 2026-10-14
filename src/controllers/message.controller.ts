import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';
import { parseNonEmptyString, parsePositiveInteger } from '../utils/validation';
import { AppError } from '../utils/AppError';

export class MessageController {
  static async send(req: Request, res: Response): Promise<void> {
    const chatId = parsePositiveInteger(req.params.chatId, 'chatId');
    const senderId = parsePositiveInteger(req.body.senderId, 'senderId');
    const text = parseNonEmptyString(req.body.text, 'text', 5000);
    const message = await MessageService.sendMessage(chatId, senderId, text);
    res.status(201).json({ success: true, message: 'Message sent successfully', data: message });
  }

  static async list(req: Request, res: Response): Promise<void> {
    const chatId = parsePositiveInteger(req.params.chatId, 'chatId');
    // userId is included so the API can enforce chat membership even before JWT auth is added.
    const userId = parsePositiveInteger(req.query.userId, 'userId');
    const requestedLimit = req.query.limit === undefined ? 50 : Number(req.query.limit);
    if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
      throw new AppError('limit must be a positive integer', 400);
    }
    const limit = Math.min(requestedLimit, 100);
    const messages = await MessageService.getMessages(chatId, userId, limit);
    res.status(200).json({ success: true, data: messages, meta: { count: messages.length, limit } });
  }

  static async markRead(req: Request, res: Response): Promise<void> {
    const chatId = parsePositiveInteger(req.params.chatId, 'chatId');
    const messageId = parseNonEmptyString(req.params.messageId, 'messageId', 200);
    const userId = parsePositiveInteger(req.body.userId, 'userId');
    const receipt = await MessageService.markMessageRead(chatId, messageId, userId);
    res.status(200).json({ success: true, message: 'Message marked as read', data: receipt });
  }

  static async updateLastSeen(req: Request, res: Response): Promise<void> {
    const chatId = parsePositiveInteger(req.params.chatId, 'chatId');
    const userId = parsePositiveInteger(req.body.userId, 'userId');
    const messageId = parseNonEmptyString(req.body.messageId, 'messageId', 200);
    const result = await MessageService.updateLastSeen(chatId, userId, messageId);
    res.status(200).json({ success: true, message: 'Last-seen message updated', data: result });
  }
}

import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { MessageController } from '../controllers/message.controller';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.post('/create', asyncHandler(ChatController.createOrGet));
router.post('/:chatId/message/send', asyncHandler(MessageController.send));
router.get('/:chatId/messages', asyncHandler(MessageController.list));
router.post('/:chatId/message/:messageId/read', asyncHandler(MessageController.markRead));
router.post('/:chatId/lastseen', asyncHandler(MessageController.updateLastSeen));

export default router;

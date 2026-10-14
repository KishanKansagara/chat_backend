import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();
router.get('/:userId/chats', asyncHandler(UserController.listChats));
export default router;

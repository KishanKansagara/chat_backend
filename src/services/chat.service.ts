import { Op, Transaction } from 'sequelize';
import { sequelize } from '../config/database';
import { Chat, ChatMember, User } from '../models';
import { AppError } from '../utils/AppError';
import { firestore } from '../config/firebase';

export class ChatService {
  static async createOrGetDirectChat(userAId: number, userBId: number) {
    if (userAId === userBId) throw new AppError('A direct chat requires two different users', 400);

    const [firstId, secondId] = [userAId, userBId].sort((a, b) => a - b);
    const pairKey = `${firstId}:${secondId}`;

    try {
      return await sequelize.transaction(async (transaction: Transaction) => {
        const users = await User.findAll({
          where: { id: { [Op.in]: [firstId, secondId] } },
          transaction
        });
        if (users.length !== 2) throw new AppError('One or both users do not exist', 404);

        const existing = await Chat.findOne({ where: { pairKey }, transaction });
        if (existing) return { chat: existing, created: false };

        const chat = await Chat.create({ type: 'direct', pairKey }, { transaction });
        await ChatMember.bulkCreate([
          { chatId: chat.id, userId: firstId },
          { chatId: chat.id, userId: secondId }
        ], { transaction });
        return { chat, created: true };
      });
    } catch (error) {
      // A unique pairKey constraint protects against concurrent duplicate creations.
      const existing = await Chat.findOne({ where: { pairKey } });
      if (existing) return { chat: existing, created: false };
      throw error;
    }
  }

  static async assertChatMember(chatId: number, userId: number): Promise<void> {
    const membership = await ChatMember.findOne({ where: { chatId, userId } });
    if (!membership) throw new AppError('User is not a member of this chat', 403);
  }

  static async assertChatExists(chatId: number): Promise<Chat> {
    const chat = await Chat.findByPk(chatId);
    if (!chat) throw new AppError('Chat not found', 404);
    return chat;
  }

  static async assertFirestoreMessageExists(chatId: number, messageId: string) {
    const ref = firestore.collection('chats').doc(String(chatId)).collection('messages').doc(messageId);
    const snapshot = await ref.get();
    if (!snapshot.exists) throw new AppError('Message not found', 404);
    return { ref, data: snapshot.data() as Record<string, unknown> };
  }
}

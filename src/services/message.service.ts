import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { firestore } from '../config/firebase';
import { ChatMember, User } from '../models';
import { AppError } from '../utils/AppError';
import { ChatService } from './chat.service';

export class MessageService {
  static async sendMessage(chatId: number, senderId: number, text: string) {
    await ChatService.assertChatExists(chatId);
    await ChatService.assertChatMember(chatId, senderId);
    const sender = await User.findByPk(senderId);
    if (!sender) throw new AppError('Sender not found', 404);

    const messageRef = firestore.collection('chats').doc(String(chatId)).collection('messages').doc();
    const timestamp = FieldValue.serverTimestamp();
    await messageRef.set({
      id: messageRef.id,
      chatId: String(chatId),
      senderId,
      text,
      timestamp,
      createdAt: timestamp
    });

    return { id: messageRef.id, chatId, senderId, text, timestamp: new Date().toISOString() };
  }

  static async getMessages(chatId: number, requestingUserId: number, limit: number) {
    await ChatService.assertChatExists(chatId);
    await ChatService.assertChatMember(chatId, requestingUserId);

    const snapshot = await firestore.collection('chats').doc(String(chatId)).collection('messages')
      .orderBy('timestamp', 'asc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp as Timestamp | undefined;
      return {
        id: doc.id,
        ...data,
        timestamp: timestamp?.toDate().toISOString() ?? null
      };
    });
  }

  static async markMessageRead(chatId: number, messageId: string, userId: number) {
    await ChatService.assertChatExists(chatId);
    await ChatService.assertChatMember(chatId, userId);
    const { ref } = await ChatService.assertFirestoreMessageExists(chatId, messageId);
    const receiptRef = ref.collection('readReceipts').doc(String(userId));
    await receiptRef.set({ userId, readAt: FieldValue.serverTimestamp() }, { merge: true });
    return { chatId, messageId, userId, read: true };
  }

  static async updateLastSeen(chatId: number, userId: number, messageId: string) {
    await ChatService.assertChatExists(chatId);
    await ChatService.assertChatMember(chatId, userId);
    const { data } = await ChatService.assertFirestoreMessageExists(chatId, messageId);
    if (String(data.chatId) !== String(chatId)) throw new AppError('Message does not belong to this chat', 400);

    const lastSeenRef = firestore.collection('chats').doc(String(chatId)).collection('lastSeen').doc(String(userId));
    const current = await lastSeenRef.get();
    const currentMessageId = current.exists ? current.get('messageId') as string | undefined : undefined;

    if (currentMessageId && currentMessageId !== messageId) {
      const [currentMessage, newMessage] = await Promise.all([
        ChatService.assertFirestoreMessageExists(chatId, currentMessageId),
        ChatService.assertFirestoreMessageExists(chatId, messageId)
      ]);
      const currentTimestamp = currentMessage.data.timestamp as Timestamp | undefined;
      const newTimestamp = newMessage.data.timestamp as Timestamp | undefined;
      if (currentTimestamp && newTimestamp && newTimestamp.toMillis() < currentTimestamp.toMillis()) {
        throw new AppError('Last-seen message cannot move backwards', 400);
      }
    }

    await lastSeenRef.set({ messageId, userId, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return { chatId, userId, messageId, updated: true };
  }
}

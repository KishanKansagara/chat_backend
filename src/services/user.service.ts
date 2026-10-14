import { Chat, ChatMember, User } from '../models';
import { AppError } from '../utils/AppError';

export class UserService {
  static async listChats(userId: number) {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    const memberships = await ChatMember.findAll({
      where: { userId },
      include: [{
        model: Chat,
        as: 'chat',
        required: true,
        include: [{ model: User, as: 'members', attributes: ['id', 'name', 'email'], through: { attributes: [] } }]
      }],
      order: [['createdAt', 'DESC']]
    });

    return memberships.map((membership) => {
      const chat = (membership as ChatMember & { chat: Chat & { members: User[] } }).chat;
      return {
        chatId: chat.id,
        type: chat.type,
        createdAt: chat.createdAt,
        memberIds: chat.members.map((member) => member.id),
        members: chat.members.map((member) => ({ id: member.id, name: member.name, email: member.email }))
      };
    });
  }
}

import { Chat } from './Chat.model';
import { ChatMember } from './ChatMember.model';
import { User } from './User.model';

User.belongsToMany(Chat, { through: ChatMember, foreignKey: 'userId', otherKey: 'chatId', as: 'chats' });
Chat.belongsToMany(User, { through: ChatMember, foreignKey: 'chatId', otherKey: 'userId', as: 'members' });
Chat.hasMany(ChatMember, { foreignKey: 'chatId', as: 'memberships' });
ChatMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ChatMember.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });

export { User, Chat, ChatMember };

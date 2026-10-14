import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class ChatMember extends Model<InferAttributes<ChatMember>, InferCreationAttributes<ChatMember>> {
  declare id: CreationOptional<number>;
  declare chatId: number;
  declare userId: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ChatMember.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  chatId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  createdAt: { type: DataTypes.DATE, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false }
}, {
  sequelize,
  tableName: 'chat_members',
  indexes: [{ unique: true, fields: ['chat_id', 'user_id'] }, { fields: ['user_id', 'chat_id'] }]
});

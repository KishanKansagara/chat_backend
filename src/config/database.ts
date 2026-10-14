import { Sequelize } from 'sequelize';

const requiredEnv = ['DB_NAME', 'DB_USER', 'DB_HOST'] as const;
for (const key of requiredEnv) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

export const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD ?? '',
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    dialect: 'mysql',
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    define: { underscored: true, timestamps: true }
  }
);

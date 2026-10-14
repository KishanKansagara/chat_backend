import 'dotenv/config';
import app from './app';
import { sequelize } from './config/database';
import './config/firebase';
import './models';

const port = Number(process.env.PORT ?? 3000);

async function startServer(): Promise<void> {
  try {
    await sequelize.authenticate();
    // For a practical submission this creates tables automatically. Use migrations in production.
    await sequelize.sync();
    app.listen(port, () => console.log(`Chat API listening on port ${port}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

void startServer();

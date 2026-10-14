import express from 'express';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { AppError } from './utils/AppError';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.status(200).json({ success: true, message: 'Chat API is healthy' }));
app.use('/api', routes);
app.use((_req, _res, next) => next(new AppError('Route not found', 404)));
app.use(errorMiddleware);

export default app;

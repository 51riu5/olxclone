import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import { getEnv } from './utils/env';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';
import listingsRouter from './routes/listings';
import messagesRouter from './routes/messages';
import uploadsRouter from './routes/uploads';

const app = express();

const env = getEnv();

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// static file serving for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'olxclone-backend', version: '0.1.0' });
});

app.use('/api/auth', authRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/uploads', uploadsRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Backend listening on http://localhost:${env.PORT}`);
});



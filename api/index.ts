import express from 'express';
import { connectDB, getDBStatus } from '../server/db.ts';

import authRoutes from '../server/routes/auth.ts';
import subjectRoutes from '../server/routes/subjects.ts';
import taskRoutes from '../server/routes/tasks.ts';
import sessionRoutes from '../server/routes/sessions.ts';
import analyticsRoutes from '../server/routes/analytics.ts';
import aiRoutes from '../server/routes/ai.ts';

const app = express();

app.use(express.json());

app.use(async (_req, res, next) => {
  try {
    await connectDB();

    if (!getDBStatus().isConnected) {
      return res.status(503).json({
        error: 'Database connection unavailable',
        database: getDBStatus(),
      });
    }

    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(503).json({ error: 'Database connection failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'FocusFlow API',
    database: getDBStatus(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

export default app;
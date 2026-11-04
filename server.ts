import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB, getDBStatus } from './server/db.ts';
import authRoutes from './server/routes/auth.ts';
import subjectRoutes from './server/routes/subjects.ts';
import taskRoutes from './server/routes/tasks.ts';
import sessionRoutes from './server/routes/sessions.ts';
import analyticsRoutes from './server/routes/analytics.ts';
import aiRoutes from './server/routes/ai.ts';
import { setServers } from 'node:dns';

dotenv.config();
setServers(['8.8.8.8', '1.1.1.1']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parsePort(): number {
  // 1. CLI argument: --port 3000
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  // 2. DEFAULT_APP_PORT (configured by AI Studio supervisor, e.g. '3000')
  if (process.env.DEFAULT_APP_PORT) {
    const parsed = parseInt(process.env.DEFAULT_APP_PORT, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  // 3. process.env.PORT, but NOT 8080 (which is used by Nginx reverse proxy in this container)
  if (process.env.PORT && process.env.PORT !== '8080') {
    const parsed = parseInt(process.env.PORT, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  // Default fallback for AI Studio container
  return 3000;
}

function parseHost(): string {
  const hostArgIndex = process.argv.indexOf('--host');
  if (hostArgIndex !== -1 && process.argv[hostArgIndex + 1]) {
    return process.argv[hostArgIndex + 1];
  }
  return '0.0.0.0';
}

async function startServer() {
  const app = express();
  const PORT = parsePort();
  const HOST = parseHost();
  const isProd = process.env.NODE_ENV === 'production';

  // Body parser
  app.use(express.json());

  // Connect to Database
  await connectDB();

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/subjects', subjectRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/ai', aiRoutes);

  // Health and System Diagnostics - support both /health and /api/health
  const healthHandler = (_req: express.Request, res: express.Response) => {
    const dbStatus = getDBStatus();
    res.json({
      status: 'ok',
      service: 'FocusFlow API',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      port: PORT,
    });
  };

  app.get('/api/health', healthHandler);
  app.get('/health', healthHandler);

  // Frontend Serving: Vite dev middleware or production static
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, HOST, () => {
console.log(`[FocusFlow] Application running at: http://localhost:${PORT}`);
console.log(`[FocusFlow] Mode: ${isProd ? 'production' : 'development'}`);
  });

  const handleShutdown = (signal: string) => {
    console.log(`[FocusFlow] Received ${signal}, closing server gracefully...`);
    server.close(() => {
      console.log('[FocusFlow] Server closed.');
      process.exit(0);
    });
    setTimeout(() => {
      process.exit(0);
    }, 2000).unref();
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('[FocusFlow] Fatal error during server startup:', err);
  process.exit(1);
});

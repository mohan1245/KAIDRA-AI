import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import path from 'path';

import chatRouter from './routes/chat.route';
import { SessionStore } from './session/session.store';

const app = express();

const PORT = Number(process.env.PORT) || 3100;

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------
// Static Widget
// --------------------------------------------------

app.use(
  express.static(
    path.join(__dirname, '..', 'widget')
  )
);

// --------------------------------------------------
// API
// --------------------------------------------------

app.use('/api/website-agent', chatRouter);

// --------------------------------------------------
// Health Check
// --------------------------------------------------

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'kaidra-website-agent',
    timestamp: new Date().toISOString(),
  });
});

// --------------------------------------------------
// 404
// --------------------------------------------------

app.use((_req, res) => {
  res.status(404).json({
    error: 'Route not found',
  });
});

// --------------------------------------------------
// Error Handler
// --------------------------------------------------

app.use(
  (
    err: Error & { status?: number },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);

    res.status(err.status || 500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'production'
          ? 'Something went wrong'
          : err.message,
    });
  }
);

// --------------------------------------------------
// Session Cleanup
// --------------------------------------------------

setInterval(() => {
  try {
    SessionStore.clearExpired();
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
}, 10 * 60 * 1000);

// --------------------------------------------------
// Start
// --------------------------------------------------

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Kaidra Website Agent running on port ${PORT}`);
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Widget: http://localhost:${PORT}/`);
  console.log(`Demo: http://localhost:${PORT}/Demo.html`);
  console.log(`Embed: http://localhost:${PORT}/embed.js`);
  console.log(`Health: http://localhost:${PORT}/health`);
});

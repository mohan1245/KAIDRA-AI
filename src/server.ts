import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import path from 'path';

import chatRouter from './routes/chat.route';
import { SessionStore } from './session/session.store';

const app = express();

const PORT = Number(process.env.PORT) || 3100;

app.use(cors());

app.use(express.json());

// Serve widget files
app.use(
  express.static(
    path.join(__dirname, '..', 'widget')
  )
);

// API
app.use('/api/website-agent', chatRouter);

// Health
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'kaidra-website-agent',
  });
});

// Session cleanup
setInterval(() => {
  SessionStore.clearExpired();
}, 10 * 60 * 1000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Kaidra AI running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

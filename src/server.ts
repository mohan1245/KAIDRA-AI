import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import chatRouter from './routes/chat.route';
import { SessionStore } from './session/session.store';

const app = express();
const PORT = process.env.PORT || 3100;

app.use(cors());
app.use(express.json());

// Serve the chat widget directly at http://localhost:3100
app.use(express.static(path.join(__dirname, '..', 'widget')));

app.use('/api/website-agent', chatRouter);

setInterval(() => SessionStore.clearExpired(), 10 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
import * as fs from 'fs';
import * as path from 'path';

// Every user + assistant turn gets appended as its own line to a per-day
// file, so logs are easy to tail/grep and never require rewriting a whole file.
const CONVERSATIONS_DIR = path.join(__dirname, '..', '..', 'data', 'conversations');

export function logTurn(sessionId: string, role: string, content: string): void {
  fs.mkdirSync(CONVERSATIONS_DIR, { recursive: true });
  const day = new Date().toISOString().slice(0, 10); // e.g. "2026-07-24"
  const file = path.join(CONVERSATIONS_DIR, `${day}.jsonl`);
  const line = JSON.stringify({
    sessionId,
    timestamp: new Date().toISOString(),
    role,
    content,
  });
  fs.appendFileSync(file, line + '\n');
}
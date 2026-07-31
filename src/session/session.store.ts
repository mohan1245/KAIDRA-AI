interface ISession {
  messages: { role: string; content: string }[];
  last_active: Date;
}

// Simple in-memory store — no database needed
const sessions = new Map<string, ISession>();
const TTL_MS = 30 * 60 * 1000; // sessions expire after 30 minutes

export const SessionStore = {
  getHistory(session_id: string): { role: string; content: string }[] {
    return sessions.get(session_id)?.messages ?? [];
  },

  addMessage(session_id: string, role: string, content: string): void {
    if (!sessions.has(session_id)) {
      sessions.set(session_id, { messages: [], last_active: new Date() });
    }
    const session = sessions.get(session_id)!;
    session.messages.push({ role, content });
    session.last_active = new Date();
  },

  clearExpired(): void {
    const now = Date.now();
    for (const [id, session] of sessions.entries()) {
      if (now - session.last_active.getTime() > TTL_MS) {
        sessions.delete(id);
      }
    }
  },
};

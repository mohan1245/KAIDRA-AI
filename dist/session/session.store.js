"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStore = void 0;
// Simple in-memory store — no database needed
const sessions = new Map();
const TTL_MS = 30 * 60 * 1000; // sessions expire after 30 minutes
exports.SessionStore = {
    getHistory(session_id) {
        return sessions.get(session_id)?.messages ?? [];
    },
    addMessage(session_id, role, content) {
        if (!sessions.has(session_id)) {
            sessions.set(session_id, { messages: [], last_active: new Date() });
        }
        const session = sessions.get(session_id);
        session.messages.push({ role, content });
        session.last_active = new Date();
    },
    clearExpired() {
        const now = Date.now();
        for (const [id, session] of sessions.entries()) {
            if (now - session.last_active.getTime() > TTL_MS) {
                sessions.delete(id);
            }
        }
    },
};

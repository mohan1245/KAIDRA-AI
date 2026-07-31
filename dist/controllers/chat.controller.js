"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatHandler = chatHandler;
const website_agent_graph_1 = require("../graph/website-agent.graph");
const session_store_1 = require("../session/session.store");
const conversation_logger_1 = require("../session/conversation.logger");
async function chatHandler(req, res) {
    const { session_id, message, language } = req.body;
    if (!session_id || !message) {
        return res.status(400).json({ error: 'session_id and message are required' });
    }
    try {
        // Get conversation history for this session
        const history = session_store_1.SessionStore.getHistory(session_id);
        // Run the LangGraph with the current message + history
        const result = await website_agent_graph_1.websiteAgentGraph.invoke({
            session_id,
            user_message: message,
            reply_language: language || 'English',
            conversation_history: history,
            requires_kb: false,
            intent: '',
            kb_result: '',
            final_response: '',
        });
        // Save this exchange to session memory
        session_store_1.SessionStore.addMessage(session_id, 'user', message);
        session_store_1.SessionStore.addMessage(session_id, 'assistant', result.final_response);
        // Save this exchange to the persistent daily log
        (0, conversation_logger_1.logTurn)(session_id, 'user', message);
        (0, conversation_logger_1.logTurn)(session_id, 'assistant', result.final_response);
        return res.status(200).json({
            reply: result.final_response,
            session_id,
        });
    }
    catch (err) {
        console.error('[Chat] Error:', err.message);
        return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
}

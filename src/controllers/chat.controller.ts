import { Request, Response } from 'express';
import { websiteAgentGraph } from '../graph/website-agent.graph';
import { SessionStore } from '../session/session.store';
import { logTurn } from '../session/conversation.logger';

export async function chatHandler(req: Request, res: Response) {
  const { session_id, message, language } = req.body;

  if (!session_id || !message) {
    return res.status(400).json({ error: 'session_id and message are required' });
  }

  try {
    // Get conversation history for this session
    const history = SessionStore.getHistory(session_id);

    // Run the LangGraph with the current message + history
    const result = await websiteAgentGraph.invoke({
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
    SessionStore.addMessage(session_id, 'user', message);
    SessionStore.addMessage(session_id, 'assistant', result.final_response);

    // Save this exchange to the persistent daily log
    logTurn(session_id, 'user', message);
    logTurn(session_id, 'assistant', result.final_response);

    return res.status(200).json({
      reply: result.final_response,
      session_id,
    });
  } catch (err: any) {
    console.error('[Chat] Error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
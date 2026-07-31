// This is the shared object that travels through all 4 nodes.
// Each node reads from it and writes back to it.

export interface IWebsiteAgentState {
  session_id: string;
  user_message: string;

  // set by the controller from the client's language dropdown
  reply_language: string;

  // set by Perceive node
  requires_kb: boolean;
  intent: string;

  // set by Retrieve node
  kb_result: string;

  // set by Generate node
  final_response: string;

  // grows after every message
  conversation_history: { role: string; content: string }[];
}
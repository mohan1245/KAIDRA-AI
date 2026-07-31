import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { IWebsiteAgentState } from '../state/agent.state';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Load system prompt once when server starts
const SYSTEM_PROMPT = fs.readFileSync(
  path.join(__dirname, '../prompts/system-prompt.txt'),
  'utf-8'
);

// Node 4: Writes the final reply using GPT
export async function generateNode(
  state: IWebsiteAgentState
): Promise<Partial<IWebsiteAgentState>> {
  const messages: any[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...state.conversation_history, // full chat history for context
  ];

  // If KB content was found, add it as extra context
  if (state.kb_result) {
    messages.push({
      role: 'system',
      content: `Use this information to answer the visitor's question:\n\n${state.kb_result}`,
    });
  }

  if (state.reply_language && state.reply_language !== 'English') {
    messages.push({
      role: 'system',
      content: `Reply in ${state.reply_language}, regardless of what language the knowledge base text above is written in. Keep the same tone and rules, just written naturally in ${state.reply_language}.`,
    });
  }

  // Add the current user message
  messages.push({ role: 'user', content: state.user_message });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
  });

  const final_response = response.choices[0].message.content ?? '';
  console.log('[Generate] Reply ready');

  return { final_response };
}
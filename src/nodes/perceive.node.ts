import OpenAI from 'openai';
import { IWebsiteAgentState } from '../state/agent.state';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Node 1: Understands what the visitor wants
export async function perceiveNode(
  state: IWebsiteAgentState
): Promise<Partial<IWebsiteAgentState>> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Analyze this website visitor message and return ONLY a JSON object.

Return format:
{
  "requires_kb": true or false,
  "intent": one of ["product_question", "pricing_question", "demo_request", "greeting", "other"]
}

Set requires_kb to TRUE if the visitor asks about:
classes, pricing, trials, membership, parking, location, schedules, coaches,
studio rules, the Reset Challenge, HYROX, or how anything at the studio works

Set requires_kb to FALSE for:
greetings like "hi" or "hello", thank you messages, simple one-word replies`,
      },
      { role: 'user', content: state.user_message },
    ],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');

  console.log('[Perceive] Intent:', result.intent, '| KB needed:', result.requires_kb);

  return {
    requires_kb: result.requires_kb ?? false,
    intent: result.intent ?? 'other',
  };
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.perceiveNode = perceiveNode;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
// Node 1: Understands what the visitor wants
async function perceiveNode(state) {
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

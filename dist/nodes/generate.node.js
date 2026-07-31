"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNode = generateNode;
const openai_1 = __importDefault(require("openai"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
// Load system prompt once when server starts
const SYSTEM_PROMPT = fs.readFileSync(path.join(__dirname, '../prompts/system-prompt.txt'), 'utf-8');
// Node 4: Writes the final reply using GPT
async function generateNode(state) {
    const messages = [
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

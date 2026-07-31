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
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveNode = retrieveNode;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Load kb.json once when server starts
const KB = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/kb.json'), 'utf-8'));
const MAX_MATCHES = 4; // cap how many entries we inject, to keep prompts small
// Node 3: Searches kb.json for matching content
function retrieveNode(state) {
    const message = state.user_message.toLowerCase();
    // Score each entry: how many of its tags (or its title) appear in the message
    const scored = KB.map(entry => {
        let score = 0;
        for (const tag of entry.tags) {
            if (message.includes(tag.toLowerCase()))
                score += 1;
        }
        if (message.includes(entry.title.toLowerCase()))
            score += 1;
        return { entry, score };
    }).filter(s => s.score > 0);
    if (!scored.length) {
        console.log('[Retrieve] No KB match found');
        return { kb_result: '' };
    }
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, MAX_MATCHES);
    const kb_result = top
        .map(s => `### ${s.entry.title}\n${s.entry.text}`)
        .join('\n\n');
    console.log(`[Retrieve] Found ${top.length} KB match(es):`, top.map(s => s.entry.id).join(', '));
    return { kb_result };
}

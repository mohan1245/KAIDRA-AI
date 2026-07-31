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
exports.logTurn = logTurn;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Every user + assistant turn gets appended as its own line to a per-day
// file, so logs are easy to tail/grep and never require rewriting a whole file.
const CONVERSATIONS_DIR = path.join(__dirname, '..', '..', 'data', 'conversations');
function logTurn(sessionId, role, content) {
    fs.mkdirSync(CONVERSATIONS_DIR, { recursive: true });
    const day = new Date().toISOString().slice(0, 10); // e.g. "2026-07-24"
    const file = path.join(CONVERSATIONS_DIR, `${day}.jsonl`);
    const line = JSON.stringify({
        sessionId,
        timestamp: new Date().toISOString(),
        role,
        content,
    });
    fs.appendFileSync(file, line + '\n');
}

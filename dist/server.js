"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const chat_route_1 = __importDefault(require("./routes/chat.route"));
const session_store_1 = require("./session/session.store");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3100;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve the chat widget directly at http://localhost:3100
app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'widget')));
app.use('/api/website-agent', chat_route_1.default);
setInterval(() => session_store_1.SessionStore.clearExpired(), 10 * 60 * 1000);
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

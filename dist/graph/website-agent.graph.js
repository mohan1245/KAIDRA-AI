"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.websiteAgentGraph = void 0;
const langgraph_1 = require("@langchain/langgraph");
const perceive_node_1 = require("../nodes/perceive.node");
const router_node_1 = require("../nodes/router.node");
const retrieve_node_1 = require("../nodes/retrieve.node");
const generate_node_1 = require("../nodes/generate.node");
// Build the graph — same pattern as Phase 2
const graph = new langgraph_1.StateGraph({
    channels: {
        session_id: { value: (_, y) => y ?? '' },
        user_message: { value: (_, y) => y ?? '' },
        reply_language: { value: (_, y) => y ?? 'English' },
        conversation_history: { value: (_, y) => y ?? [] },
        requires_kb: { value: (_, y) => y ?? false },
        intent: { value: (_, y) => y ?? '' },
        kb_result: { value: (_, y) => y ?? '' },
        final_response: { value: (_, y) => y ?? '' },
    },
});
graph
    .addNode('perceive', perceive_node_1.perceiveNode) // Node 1
    .addNode('router', router_node_1.routerNode) // Node 2
    .addNode('retrieve', retrieve_node_1.retrieveNode) // Node 3
    .addNode('generate', generate_node_1.generateNode) // Node 4
    .setEntryPoint('perceive')
    .addEdge('perceive', 'router')
    .addConditionalEdges('router', router_node_1.routerDecision, {
    retrieve: 'retrieve', // requires_kb = true  → retrieve then generate
    generate: 'generate', // requires_kb = false → go straight to generate
})
    .addEdge('retrieve', 'generate')
    .addEdge('generate', langgraph_1.END);
exports.websiteAgentGraph = graph.compile();

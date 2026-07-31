import { StateGraph, END } from '@langchain/langgraph';
import { IWebsiteAgentState } from '../state/agent.state';
import { perceiveNode } from '../nodes/perceive.node';
import { routerNode, routerDecision } from '../nodes/router.node';
import { retrieveNode } from '../nodes/retrieve.node';
import { generateNode } from '../nodes/generate.node';

// Build the graph — same pattern as Phase 2
const graph = new StateGraph<IWebsiteAgentState>({
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
  .addNode('perceive', perceiveNode) // Node 1
  .addNode('router', routerNode) // Node 2
  .addNode('retrieve', retrieveNode) // Node 3
  .addNode('generate', generateNode) // Node 4
  .setEntryPoint('perceive')
  .addEdge('perceive', 'router')
  .addConditionalEdges('router', routerDecision, {
    retrieve: 'retrieve', // requires_kb = true  → retrieve then generate
    generate: 'generate', // requires_kb = false → go straight to generate
  })
  .addEdge('retrieve', 'generate')
  .addEdge('generate', END);

export const websiteAgentGraph = graph.compile();
import { IWebsiteAgentState } from '../state/agent.state';

// Node 2: Decides which path to take
// The routerNode itself does not change state.
// routerDecision is the function that picks the next node.

export function routerNode(
  state: IWebsiteAgentState
): Partial<IWebsiteAgentState> {
  return {}; // no state change here
}

// This is used in addConditionalEdges inside the graph
export function routerDecision(state: IWebsiteAgentState): string {
  if (state.requires_kb) {
    console.log('[Router] → Retrieve (KB needed)');
    return 'retrieve';
  }
  console.log('[Router] → Generate (direct reply)');
  return 'generate';
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routerNode = routerNode;
exports.routerDecision = routerDecision;
// Node 2: Decides which path to take
// The routerNode itself does not change state.
// routerDecision is the function that picks the next node.
function routerNode(state) {
    return {}; // no state change here
}
// This is used in addConditionalEdges inside the graph
function routerDecision(state) {
    if (state.requires_kb) {
        console.log('[Router] → Retrieve (KB needed)');
        return 'retrieve';
    }
    console.log('[Router] → Generate (direct reply)');
    return 'generate';
}

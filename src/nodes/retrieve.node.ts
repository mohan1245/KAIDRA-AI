import * as fs from 'fs';
import * as path from 'path';
import { IWebsiteAgentState } from '../state/agent.state';

// Shape matches the real BFT Kampong Ubi knowledge base file (src/data/kb.json):
// each entry has tags + a title + free-text content, not a flat keyword list.
interface IKbEntry {
  id: string;
  category: string;
  tags: string[];
  title: string;
  text: string;
}

// Load kb.json once when server starts
const KB: IKbEntry[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/kb.json'), 'utf-8')
);

const MAX_MATCHES = 4; // cap how many entries we inject, to keep prompts small

// Node 3: Searches kb.json for matching content
export function retrieveNode(
  state: IWebsiteAgentState
): Partial<IWebsiteAgentState> {
  const message = state.user_message.toLowerCase();

  // Score each entry: how many of its tags (or its title) appear in the message
  const scored = KB.map(entry => {
    let score = 0;
    for (const tag of entry.tags) {
      if (message.includes(tag.toLowerCase())) score += 1;
    }
    if (message.includes(entry.title.toLowerCase())) score += 1;
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

  console.log(
    `[Retrieve] Found ${top.length} KB match(es):`,
    top.map(s => s.entry.id).join(', ')
  );

  return { kb_result };
}

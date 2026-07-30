# Kaidra Website Agent (LangGraph, Phase 2 structure)

4-node LangGraph agent for BFT Kampong Ubi's website chat, using your real
knowledge base (`src/data/kb.json` — 190+ entries on classes, pricing, trials,
the Reset Challenge, studio rules, etc). Only one API key needed: `OPENAI_API_KEY`.

## Setup

```bash
npm install
cp .env.example .env
```
Open `.env` and set your real key:
```
OPENAI_API_KEY=sk-...
PORT=3100
```

## Run

```bash
npm run dev
```
You should see: `Server running at http://localhost:3100`

Then open `widget/index.html` directly in your browser (no server needed for
the widget itself — it just calls the API above).

## The 4 nodes

1. **Perceive** (`src/nodes/perceive.node.ts`) — asks GPT-4o whether this
   message needs the knowledge base, and detects intent.
2. **Router** (`src/nodes/router.node.ts`) — reads `requires_kb` and picks
   `retrieve` or `generate` as the next node.
3. **Retrieve** (`src/nodes/retrieve.node.ts`) — scores every KB entry by how
   many of its `tags` (or its `title`) appear in the message, and returns the
   top 4 matches' `text` as `kb_result`.
4. **Generate** (`src/nodes/generate.node.ts`) — sends the system prompt +
   conversation history + `kb_result` (if any) to GPT-4o and writes the reply.

## One adaptation from the reference structure

The reference doc's example `kb.json` used `{ id, keywords, content }`. Your
real knowledge base uses `{ id, category, tags, title, text }` instead — so
`retrieve.node.ts` matches against `tags`/`title` and returns `text`, rather
than a flat `keywords` array. Everything else follows the structure exactly.

## Test messages

| Type this | Expected path |
|---|---|
| "Hi" | Perceive → Router → Generate (greeting, no KB) |
| "What's your trial offer?" | Perceive → Router → Retrieve → Generate |
| "How much does the Reset Challenge cost?" | Perceive → Router → Retrieve → Generate |
| "Is there parking?" | Perceive → Router → Retrieve → Generate |
| "Can I bring my dog?" | Perceive → Router → Retrieve → Generate |

## Next steps (not built yet, ask if you want these)
- Persisting conversation history to disk/logs (currently in-memory only, like the reference spec)
- Lead capture logging (name/email → `data/leads.json`)
- Swapping local `kb.json` search for a real vector DB (Pinecone), per the "Phase 2" reference — only `retrieve.node.ts` would need to change

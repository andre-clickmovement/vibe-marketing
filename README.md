# Vibe Marketing Skills — Web UI

Your marketing team in a browser. 11 AI-powered skills, powered by Claude, deployed on Vercel.

## What This Is

A web interface for the Vibe Marketing Skills v2.0 system. Instead of installing skills into Claude Code and running terminal commands, users get:

- **Guided onboarding** — 3-step wizard (business → goal → integrations)
- **Brand dashboard** — Foundation status, skill cards, workflow templates
- **Chat interface** — Each skill runs as an AI chat powered by Claude via the Anthropic API
- **Brand memory** — Voice profile, positioning, and other context persists across sessions
- **Streaming responses** — Real-time output as Claude generates content
- **Pre-built workflows** — 6 multi-skill chains with step-by-step execution

## Quick Deploy

### Option 1: One-click Vercel deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/vibe-marketing&env=ANTHROPIC_API_KEY&envDescription=Required%20for%20AI%20chat.%20Get%20yours%20at%20console.anthropic.com)

### Option 2: Manual deploy

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/vibe-marketing.git
cd vibe-marketing

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 4. Run locally
npm run dev

# 5. Deploy to Vercel
npx vercel
```

## Environment Variables

Set these in your Vercel project settings → Environment Variables:

| Variable | Required | Purpose |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | **Yes** | Powers all AI chat via Claude Sonnet |
| `REPLICATE_API_TOKEN` | No | Enables AI image + video generation |
| `MAILCHIMP_API_KEY` | No | Direct email sequence deployment |

## Architecture

```
vibe-marketing/
├── api/
│   └── chat.js              # Vercel serverless function (proxies Anthropic API)
├── src/
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # Root component + routing
│   ├── index.css            # Design system (CSS variables, animations)
│   ├── components/
│   │   ├── Splash.jsx       # Landing page
│   │   ├── Onboarding.jsx   # 3-step setup wizard
│   │   ├── Dashboard.jsx    # Brand status + skill grid + workflows
│   │   ├── SkillChat.jsx    # Chat interface for running skills
│   │   └── WorkflowView.jsx # Multi-step workflow planner
│   ├── hooks/
│   │   ├── useBrandStore.js # Brand memory (localStorage persistence)
│   │   └── useChat.js       # Streaming chat with API
│   └── data/
│       ├── skills.js        # Skill registry, workflows, metadata
│       └── prompts.js       # System prompts (skill methodology)
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── .env.example
```

### Key Design Decisions

- **API key stays server-side** — The `/api/chat.js` serverless function proxies all Anthropic API calls. The API key never reaches the browser.
- **Brand memory in localStorage** — Brand context (voice profile, positioning, etc.) persists across sessions in the browser. For multi-user or cross-device support, swap to Supabase/Postgres.
- **Streaming SSE** — Responses stream in real-time via Server-Sent Events. The chat hook handles both streaming and non-streaming responses.
- **Markdown rendering** — Skill output is rendered as rich markdown with syntax highlighting, tables, and code blocks via `react-markdown`.
- **Selective context passing** — Following the original system's Context Matrix, only relevant brand data is passed to each skill (not everything).

## Development

```bash
# Install
npm install

# Dev server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Extending

### Adding a new skill

1. Add the skill definition to `src/data/skills.js` (SKILLS array)
2. Add its system prompt to `src/data/prompts.js`
3. Done — the dashboard and chat UI pick it up automatically

### Upgrading to full SKILL.md prompts

The system prompts in `prompts.js` are condensed versions. For production-quality output, replace them with the full SKILL.md content from the original package. The `buildSystemPrompt()` function is the single point to modify.

### Adding authentication

For multi-user support:
1. Add Vercel Auth or Clerk
2. Replace localStorage brand store with a database (Supabase, PlanetScale, etc.)
3. Key brand data by user ID

## Based On

[Vibe Marketing Skills v2.0](https://github.com/YOUR_USERNAME/vibe-skills-v2) — 11 marketing skills, 5 creative engine modes, shared brand memory, and a visual design system. Originally built for Claude Code.

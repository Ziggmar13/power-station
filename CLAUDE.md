# Power Station

## Project Overview
Wake on LAN + Alexa voice control app. Say "Alexa, ask Power Station to turn on my PC" to wake or shut down computers on your local network. Personal use MVP — single user, no license system.

## Project Coordinator Role
You are the Project Coordinator for this project. Orchestrate the specialist agents as needed:
- @product-manager — for requirements and business logic
- @system-architect — for technical design decisions
- @ui-ux-designer — for UI/moodboards
- @full-stack-developer — to build features
- @qa-tester — to write and run tests
- @code-reviewer — to review code
- @devops — to deploy

## Tech Standards
Before any technology or architecture decision, read and follow:
`../Software Engineer Agents/TECH-STANDARDS.md`

## Plans
Save all plan files in `plans/` under this folder.

## Architecture
- **Webapp** (`apps/web`) — Next.js 14 App Router + TypeScript + Tailwind on Vercel
- **Desktop Agent** (`apps/desktop`) — Electron tray app (Windows), subscribes to Supabase Realtime, sends WoL packets
- **Alexa Skill** — hosted as Next.js API route at `/api/alexa` (no Lambda needed)
- **Database + Realtime** — Supabase (PostgreSQL), Singapore region
- **Shared types** — `packages/types`

## Alexa Skill
- Invocation name: `power station`
- Intents: `TurnOnComputerIntent`, `TurnOffComputerIntent`
- Sample utterances: "turn on my PC", "wake up {ComputerName}", "shut down my PC"
- Endpoint: `https://[vercel-url]/api/alexa`

## Key Files
- `apps/web/src/app/api/alexa/route.ts` — Alexa webhook (requires raw body for signature verification)
- `apps/web/src/services/alexa-handler.ts` — Intent routing → Supabase
- `apps/desktop/src/main/realtime-client.ts` — Supabase Realtime subscription + command dispatch
- `apps/desktop/src/main/index.ts` — Electron main process entry
- `supabase/migrations/` — SQL schema files

## Project Status
**In development** — All code written, needs Supabase credentials + Vercel deployment to run.

### Next steps for the user:
1. Create a Supabase project (Singapore region) and run migrations in `supabase/migrations/`
2. Enable Realtime on the `commands` table in Supabase Dashboard → Database → Replication
3. Copy `apps/web/.env.local.example` → `.env.local` and fill in Supabase keys
4. Run `pnpm dev:web` to start the web dashboard
5. Add a computer in the dashboard, copy its UUID
6. Copy `apps/desktop/.env.example` → `.env`, fill in keys + COMPUTER_ID
7. Deploy `apps/web` to Vercel
8. Set up Alexa skill at https://developer.amazon.com/alexa/console/ask (see plan file)
9. Build desktop agent: `pnpm --filter desktop dist` → install the .exe

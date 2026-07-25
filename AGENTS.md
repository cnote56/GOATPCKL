# GOATPCKL Developer & Agent Guidelines

## Project Overview
GOATPCKL is a full-stack fantasy sports app featuring NBA player tracking, Gemini AI-powered trivia, XP wagers, community chat, and an integrated **NFL Fantasy Football Suite** featuring a Mock Draft Simulator with strategy blueprints and a Live-Sync Roster Optimizer.

## Architecture Guidelines
- **Frontend Framework**: React with TypeScript & Tailwind CSS.
- **Backend Architecture**: Express server (`server.ts`) serving as an API proxy and mounting Vite middleware in development. Production bundle produced via `esbuild`.
- **Database & Persistence**: MongoDB via Mongoose/Native Client with an in-memory fallback mechanism if `MONGODB_URI` is unconfigured.
- **AI Integration**: Server-side Google GenAI SDK (`@google/genai`) using Gemini Flash models with lazy initialization.

## Core Modules & Key Components
1. **Mock Draft Simulator**:
   - Strategy selection (Hero-RB, Zero-RB, Robust-RB).
   - Monte Carlo draft survival probability calculations.
   - **Share Roster**: Compiles starting lineup and draft grade into a chat message dispatched to `/api/chats`.
2. **Live-Sync Roster Optimizer**:
   - Sleeper API integration.
   - **Roster Heatmap**: Color-coded visualization relative to positional benchmarks (`High-Value`, `Above Avg`, `Neutral`, `Below Avg`, `Liability`).
3. **Community Chat Room**:
   - `/api/chats` endpoint handling user messages, video links, and automated roster/matchup announcements.
4. **XP Shop & GOAT Wagers**:
   - XP wagering on NBA historical benchmarks and power-up purchases (Insurance, Stat Offset).

## Verification Workflow
- Before concluding edits, run `lint_applet` and `compile_applet` to ensure type safety and build compatibility.

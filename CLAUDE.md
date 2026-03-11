# US Market Pulse

## Overview
Public interactive dashboard visualizing key US economic indicators using 14+ distinct Nivo chart types. Data auto-updates daily via GitHub Actions from FRED/BLS/Census APIs.

## Stack
- Frontend: Next.js 14+ / TypeScript / Tailwind CSS / Nivo charts
- Backend: FastAPI (Python) / PostgreSQL (Railway)
- Deploy: Vercel (frontend), Railway (backend)
- Data: FRED API, BLS API, Census API
- Scheduler: GitHub Actions cron

## Project Structure
- `frontend/` — Next.js app with Nivo visualizations
- `backend/` — FastAPI with PostgreSQL
- `scripts/` — Data collection and backfill scripts
- `docs/` — PRD, plans, design brief

## Commands
To be defined after framework initialization.

## Rules
- Follow workflow: PRD → Design → Phases → Plan → Issues → Code → Review
- Never push to main directly — PRs only
- Every commit references an issue: `closes #N`
- Workflow state: `.workflow-state.json`
- All documentation in English
- Use Nivo (NOT Recharts) for all charts — `@nivo/*` packages
- Before any UI work, read docs/design-brief.md and follow its guidelines
- DM Sans font, Scalix-inspired design (clean white cards, airy spacing)
- Always use Responsive* Nivo variants
- Enable `animate={true}` on all charts
- Delta colors follow economic logic (see PRD Section 9)

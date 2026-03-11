# US Market Pulse

Interactive dashboard visualizing key US economic indicators using **14+ distinct chart types**. Data auto-updates daily from official government APIs.

<!-- TODO: Add screenshot after deploy -->
<!-- ![Dashboard Screenshot](docs/screenshots/overview.png) -->

## Features

- **14+ Nivo chart types** — bar, line, area, calendar heatmap, treemap, waffle, bump, scatter, radar, funnel, bullet, and more
- **3 dashboard tabs** — Overview, Labor & Economy, Markets & Sectors
- **Daily auto-update** — GitHub Actions cron fetches fresh data from FRED/BLS/Census APIs
- **KPI strip** with sparklines and economic color logic (green = good, red = bad for each metric)
- **Responsive design** — desktop, tablet, and mobile layouts
- **Loading skeletons** and error boundaries for polished UX

## Architecture

```
FRED / BLS / Census APIs
        │
        ▼
GitHub Actions (daily cron)
        │
        ▼
   Python ETL scripts
        │
        ▼
  PostgreSQL (Railway)
        │
        ▼
   FastAPI backend
        │
        ▼
  Next.js + Nivo frontend (Vercel)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Charts | Nivo (`@nivo/*`) — 14+ chart types |
| Backend | FastAPI (Python) |
| Database | PostgreSQL (Railway) |
| Data Sources | FRED API, BLS API, Census API |
| Scheduler | GitHub Actions cron |
| Deploy | Vercel (frontend), Railway (backend) |

## Chart Types Used

| Chart | Library | Tab |
|-------|---------|-----|
| Bar (waterfall) | `@nivo/bar` | Overview |
| Bar (quarterly) | `@nivo/bar` | Overview |
| Calendar heatmap | `@nivo/calendar` | Overview, Labor |
| Funnel | `@nivo/funnel` | Overview, Labor |
| Bullet | `@nivo/bullet` | Overview |
| Waffle | `@nivo/waffle` | Overview, Markets |
| Bump | `@nivo/bump` | Labor |
| Heatmap | `@nivo/heatmap` | Labor |
| Scatter plot | `@nivo/scatterplot` | Labor |
| Line (multi-series) | `@nivo/line` | Markets |
| Treemap | `@nivo/treemap` | Markets |
| Radar | `@nivo/radar` | Markets |
| Area | `@nivo/line` | Markets |
| Sparkline | `@nivo/line` | KPI Strip |

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL (or Railway connection string)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://user:pass@host:port/db"

# Run
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Data Collection

```bash
cd scripts
pip install -r ../backend/requirements-collector.txt

# Backfill 5 years of historical data
python backfill.py

# Or run daily collection
python collect.py
```

## Environment Variables

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | FastAPI backend URL | `http://localhost:8000` |
| `NEXT_PUBLIC_SITE_URL` | Site URL for OG meta | `http://localhost:3000` |

### Backend

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `FRED_API_KEY` | FRED API key ([get one](https://fred.stlouisfed.org/docs/api/api_key.html)) |

## Deployment

### Frontend (Vercel)

1. Import the repo on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variable `NEXT_PUBLIC_API_URL` pointing to Railway backend
4. Deploy

### Backend (Railway)

1. Create a new project on [railway.app](https://railway.app)
2. Add PostgreSQL plugin
3. Deploy from the `backend` directory
4. Set `FRED_API_KEY` environment variable

### Daily Data Collection

GitHub Actions workflow (`.github/workflows/collect-data.yml`) runs daily at 6 AM UTC. Requires `DATABASE_URL` and `FRED_API_KEY` secrets configured in the repo.

## License

MIT

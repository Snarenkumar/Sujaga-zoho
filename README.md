# Sujaga (ಸುಜಾಗ)

Karnataka Police Crime Intelligence Platform — hackathon prototype built on Zoho ecosystem branding.

## Quick Start

```bash
npm install
npm start
```

Open **http://localhost:3000** in your browser.

## Dev Mode

```bash
npm run dev
```

Uses nodemon for auto-reload.

## Demo Flow

1. **Landing** — Select a role (Data Entry / Investigator / Supervisor)
2. **Data Entry** — Submit an FIR with MO text containing `chain`, `two-wheeler`, or `pulsar` to trigger live cross-district MO match
3. **Investigator Chat** — Ask Zia canned questions; proactive alert appears after ~5 seconds
4. **Supervisor Dashboard** — Stats, Chart.js charts, risk scoreboard
5. **Hotspot Map** — Leaflet map with Karnataka FIR markers
6. **Network Graph** — vis-network accused relationship graph with edge decay
7. **Evidence Trail** — MO comparison audit log (modal or dedicated page)

## Tech Stack

- Node.js + Express + EJS
- Mock JSON data in `/data` (no database)
- Chart.js, Leaflet.js, vis-network (CDN)
- No external AI/LLM calls

## Requirements

- Node.js 18+ recommended

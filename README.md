# Prism Finance

A modern AI-powered personal finance app with a premium **liquid glass** UI — glassmorphism, cinematic animations, and intelligent budgeting assistance. Built for Philippine Peso (₱) by default.

## Features

- **Multi-account balance tracking** — PayPal, debit, cash, and custom accounts
- **Expense system** — Categories, tags, notes, payment source, search & filter
- **Smart memory AI** — Pattern learning, autofill suggestions, recurring detection
- **AI financial assistant** — Chat interface with personalized insights
- **Savings goals** — Progress bars, milestones, completion forecasts
- **Protected savings lock** — Warning modal when spending below saved threshold
- **Budget planner** — Strict / Balanced / Flexible / Custom modes with sliders
- **Dashboard** — Charts, health score, AI insights, monthly overview
- **Export** — CSV download, offline localStorage persistence
- **Achievements** — Milestones for first expense, savings goal, budget setup

## Stack

- Next.js 15 · React 19 · TypeScript
- Tailwind CSS · Framer Motion
- Zustand (persisted state)
- Recharts

## Install as an app (no PowerShell)

See **[INSTALL.md](./INSTALL.md)** for full instructions.

| Platform | What you get |
|----------|----------------|
| **Windows** | `Prism-Finance-0.1.0.exe` — double-click to run |
| **Android** | `app-debug.apk` — install on your phone |
| **iPhone** | Add to Home Screen (PWA) from Safari |

**Easiest path:** push to GitHub → Actions → **Build installable apps** → download Artifacts.

**On your PC:** double-click **`BUILD-APPS.cmd`** (needs Node.js installed once).

## Developer mode (optional)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/           # Next.js app router
  components/    # UI, views, charts, layout
  lib/ai/        # Pattern learning, insights, assistant
  store/         # Zustand finance store
  types/         # TypeScript models
```

## Roadmap (optional extensions)

- Supabase auth & cloud sync
- PDF export via jsPDF
- Push notifications
- Real LLM integration (OpenAI / Anthropic) for assistant

## License

MIT

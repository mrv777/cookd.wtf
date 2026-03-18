# 🔥 Cookd

> How cooked are you? Paste any wallet. Get roasted by Nansen on-chain data. Share the damage.

## What it does

1. User pastes a wallet address (ETH, Base, Solana, or ENS)
2. We pull 14+ data points from Nansen via the CLI (PnL, holdings, timing, Smart Money correlation, counterparties, etc.)
3. Gemini AI generates a personalized roast based on real trading behavior
4. Two shareable image cards are generated (Spotify Wrapped-style, per-archetype colors)
5. User shares on Twitter/Telegram — viral loop begins

## Key Differentiators

- **Multi-chain** — ETH + Base + Solana, auto-detected from address format
- **Nansen Smart Money data as humor** — "Smart Money sold. You bought. You ARE the exit liquidity."
- **Shareable image cards** — 1200x630px, dark mode, Twitter-optimized, per-archetype accent colors
- **10 degen archetypes** — The Inverse Indicator, The FOMO Farmer, The Diamond Corpse, etc.
- **Specific, data-driven roasts** — not generic "you're bad at trading" but "you bought PEPE at the literal ATH"

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Data | Nansen CLI (`nansen-cli`) + REST API fallback |
| AI | Gemini 2.5 Flash Lite via `@google/genai` |
| Image Gen | Playwright (screenshot of internal HTML cards) |
| Cache | SQLite via `better-sqlite3` (24h TTL) |
| Styling | Tailwind CSS v4 |
| Deployment | Docker + nginx on Hetzner VPS |
| Package Manager | pnpm |

## Setup

### Prerequisites

- Node.js 22+
- pnpm
- Nansen API key ([app.nansen.ai/api](https://app.nansen.ai/api))
- Gemini API key ([aistudio.google.com](https://aistudio.google.com))

### Install

```bash
pnpm install
```

### Configure

```bash
cp .env.example .env
```

Fill in your API keys:

```env
NANSEN_API_KEY=your_nansen_key
GEMINI_API_KEY=your_gemini_key
DAILY_BUDGET_CAP=10
SITE_NAME=cookd.wtf
SITE_URL=https://cookd.wtf
```

### Authenticate Nansen CLI

```bash
nansen login --api-key <your-key>
```

### Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
pnpm build
pnpm start
```

## Deploy (Docker)

```bash
docker compose up -d --build
```

This starts the Next.js app on port 3000 and nginx on port 80/443. Configure SSL by editing `nginx.conf` and adding Let's Encrypt certs.

## Project Structure

```
app/
  page.tsx                        # Landing page
  roast/[address]/page.tsx        # Results page (OG meta + roast view)
  api/roast/[address]/route.ts    # Main API: Nansen → Gemini → image
  api/og/[address]/route.ts       # Serve pre-generated OG image
  card-render/[address]/          # Internal HTML pages for Playwright screenshots
components/                       # WalletInput, RoastCard, ShareButtons, LoadingState, etc.
lib/
  nansen/                         # CLI wrapper, endpoints, types, data processor
  roast/                          # Generator, archetypes, grading, types
  image/                          # Playwright renderer + PNG storage
  cache/                          # SQLite setup + queries (24h TTL)
  rate-limit/                     # IP-based rate limiting
  budget/                         # Daily credit budget tracking
  utils/                          # Address detection, ENS resolution
```

## Hackathon Requirements

- [x] Install Nansen CLI
- [x] Make minimum 10 API calls (we make 14+ per roast)
- [x] Build something creative
- [ ] Share on X with @nansen_ai and #NansenCLI

## Cost

~$0.027 per unique roast (26 Nansen credits + Gemini). Aggressive caching means viral scenarios cost 90%+ less.

## License

MIT

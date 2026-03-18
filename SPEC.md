# Cookd — Spec

> How cooked are you? Paste any wallet. Get roasted by Nansen on-chain data. Share the damage.

## Overview

A web app that analyzes any crypto wallet using the Nansen API, generates a personalized AI roast based on real trading behavior, and produces a shareable image card optimized for Twitter/X virality.

Built for the [Nansen CLI Hackathon](https://agents.nansen.ai) (Week 1 closes Mar 22, 2026 11:59 PM SGT).

### Hackathon Requirements

- [x] Install Nansen CLI
- [x] Make minimum 10 API calls
- [x] Build something creative
- [x] Share on X with @nansen_ai and #NansenCLI

---

## Core User Flow

```
1. User lands on page → sees pre-generated example roasts (vitalik.eth, famous degens)
2. Pastes a wallet address (or ENS name)
3. Chain auto-detected from address format (0x = ETH/Base, base58 = SOL, .eth = ENS)
4. Clicks "Roast Me"
5. Loading state: fake progress bar + rotating witty messages (~5-10s)
6. Results page:
   a. Shareable summary roast card image (the hero) — above the fold
   b. Share buttons immediately visible: "Share on X" | Telegram | Download | Copy Link
   c. Second card variant: archetype-focused card — below the fold
   d. Detailed breakdown with extended roasts per category
   e. Degen archetype assignment with icon + per-archetype color
   f. "Roast a Friend" CTA with input box
   g. Referral context if arrived via ?ref= link
7. Shareable URL: cookd.wtf/roast/vitalik.eth (ENS-aware)
```

### Non-Negotiable UX Principles

- **Zero friction**: No wallet connect, no signup, no payment for the first roast. Paste address and go.
- **Fast**: Target < 10s from submit to roast.
- **Mobile-first**: Most Twitter/X traffic is mobile.
- **Dark mode**: Crypto Twitter is dark mode. Design accordingly.

---

## Competitive Landscape

| Project | Depth | Chains | Shareable Visuals | Viral? |
|---------|-------|--------|-------------------|--------|
| WalletRoast.com | Shallow (portfolio -> Grok) | Base only | None | No |
| CryptoRoast (AgentLayer) | Medium | ETH only | None | No |
| RoastMyWallet (DoraHacks) | Balance only | NEAR only | Basic | No |
| Dolos The Bully | No wallet analysis | N/A | N/A | Yes (social bot) |
| **Us** | **Deep (14 API calls)** | **Multi-chain** | **Twitter-optimized card** | **Target: yes** |

### Key Differentiators

1. **Multi-chain** — no existing roast tool does this
2. **Nansen Smart Money data as humor** — exclusive roast material (are you anti-smart-money?)
3. **Shareable image card** — Spotify Wrapped-quality, dark mode, Twitter-optimized
4. **Degen personality archetype** — identity labels people want to claim and share
5. **Specific, data-driven roasts** — not generic "you're bad at trading" but "you bought TOKEN at the literal ATH"

---

## Viral Mechanics (Research-Backed)

### Why this format works

- **Wordware Twitter Roast**: 8.1M users, $100K/3wk. Free, shareable cards, zero friction.
- **Spotify Wrapped**: 700M organic shares. Identity signaling, bold visuals, comparison-friendly.
- **Friend.tech**: 115K users in weeks. Seeded 70% of major CT influencers on day 1.

### Design for sharing

- **Images get 3x engagement** vs links on Twitter. The image card IS the product.
- **Design for screenshots**: users will screenshot and post natively, not click share links.
- **Screenshot-safe zones**: All critical content in center 80% of card. Twitter crops edges on mobile. 60px padding on all sides.
- **URL watermark on every image**: `{SITE_NAME}` visible in every screenshot = viral loop.
- **Per-archetype colors**: When 5 friends share their roast cards, each looks different → prevents feed fatigue → increases sharing.
- **Two card variants per roast**: Summary card + archetype card. Doubles sharing surface area (like Spotify Wrapped's multiple slides).
- **Pre-filled tweet**: Under 200 chars, self-deprecating, includes archetype identity label. No hashtags in text body (passed via URL param).
- **Dual share path**: "Share on X" button (URL with OG card auto-embed) + "Download Image" button (native image posts get 3x more engagement than link cards).

### Viral loop mechanics

1. **Celebrity wallet seeding**: Pre-generate roasts for vitalik.eth + famous degens. Display on landing page. When people see "Vitalik is The Diamond Corpse," they immediately want to see their own.
2. **"Roast a Friend" CTA**: Input box on results page, positioned AFTER share buttons. The user is emotionally engaged post-roast and wants to see if their friend is worse.
3. **Referral URLs**: `cookd.wtf/?ref=0xABC` → landing page shows "Your friend just got roasted. Your turn." Competitive framing increases conversion.
4. **Identity signaling**: Archetype labels ("I'm The Inverse Indicator") are personality test results people want to claim and compare.
5. **Group dynamics**: When one person in a crypto group chat shares their roast, social pressure drives others. Telegram + Discord + Copy Link buttons target this.

### What makes people share

- Self-deprecating humor that signals confidence ("I can laugh at myself")
- Specific, accurate data they can't get elsewhere
- Beautiful visuals they're proud to have on their timeline
- Identity labels ("I'm a FOMO Farmer" is shareable)
- Per-archetype colors that make their card feel unique

### What prevents sharing (avoid these)

- **Exact dollar amounts** — exposes small portfolios or painful losses. Use % and behavioral patterns instead.
- **Purely mean roasts** — the user must WANT to share. Mix roasts with flattery.
- **Ugly images** — people won't put amateur visuals on their timeline.
- **Any payment gate before first roast** — 68% of users abandon at "connect wallet" step alone.
- **Generic roasts** — "you're bad at trading" is not shareable. "You bought PEPE at the literal ATH on March 4th" is.
- **Share-gating content** — do NOT hide the roast behind a share wall. Show everything, make sharing irresistible.

### Tone

- **Mean but not cruel**. The target should laugh and immediately want to share.
- **Specific, not generic**. "You bought PEPE at the literal ATH on March 4th" >> "you make bad trades."
- **Compliment the chaos**. "You've been rugged 12 times and you're still here. That's not stupidity, that's commitment."
- **Comparisons and analogies**. "Your wallet looks like someone gave a golden retriever a Coinbase account."
- **Never punch down**. Don't mock small wallets. Mock the BEHAVIOR, not the person or their net worth.

---

## Roast Card Design

Two card variants per roast. 1200x630px (1.91:1, Twitter `summary_large_image` optimized). Dark background. Generated via Playwright screenshot of internal HTML page.

### Card Variant 1: Summary Card (primary shareable)

```
+----------------------------------------------------------+
|  [grain texture overlay, archetype accent color glow]     |
|                                                           |
|  COOKD.WTF             [chain icons]  0xd8dA...6045      |
|  ───────────────────────────────────────────────────      |
|                                                           |
|  [ICON]  THE INVERSE INDICATOR        ← 36px, accent     |
|                                                           |
|  TIMING  [F-]   DIVERSIFICATION  [D]  ← colored circles  |
|  DIAMOND HANDS  [C-]   DEGEN LEVEL [A+]                  |
|                                                           |
|  ─── VERDICT ───────────────────────────────────────      |
|  "Your wallet looks like someone gave a golden            |
|   retriever a Coinbase account."      ← 22px, white      |
|                                                           |
|  [diamond hands meter: 2/100 ████░░░░░░░░░░░░░]          |
|                                                           |
|  cookd.wtf              Powered by Nansen #NansenCLI|
+----------------------------------------------------------+
```

### Card Variant 2: Archetype Card (secondary shareable)

```
+----------------------------------------------------------+
|  [full archetype accent color glow + grain]               |
|                                                           |
|                                                           |
|          YOU ARE                                          |
|          THE INVERSE INDICATOR        ← 48px, accent     |
|          [large archetype icon]                           |
|                                                           |
|  "The market literally does the opposite of what you do.  |
|   Funds should short whatever you buy."                   |
|                                                           |
|          Overall Score: 23/100                            |
|                                                           |
|  cookd.wtf              Powered by Nansen #NansenCLI|
+----------------------------------------------------------+
```

### Visual Design System

- **Style**: Spotify Wrapped-inspired — bold, playful, bright accents on dark background
- **Fonts**: Space Grotesk Bold (headlines, grades, archetype name) + Inter (body, roast text)
- **Background**: Near-black (`#0A0A0F` to `#12121A`) — consistent across all cards
- **Body text**: Off-white (`#E8E8E8`)
- **Grade badges**: Colored circles — red (F/D), amber (C), green (B/A)
- **Micro-visualization**: One horizontal bar meter per card (e.g., diamond hands score)
- **Grain texture**: Subtle 2-3% noise overlay for premium feel
- **Safe zone**: All critical content in center 80%, 60px top/bottom padding (screenshot-optimized)
- **Minimum font size**: 24px on 1200x630 canvas (legible on mobile feeds)
- **URL watermark**: `{SITE_NAME}` at bottom — visible in every screenshot for viral loop

### Per-Archetype Accent Colors

| Archetype | Accent Color | Hex |
|-----------|-------------|-----|
| The Inverse Indicator | Angry red | `#FF4444` |
| The FOMO Farmer | Urgent orange | `#FF8C00` |
| The Rug Survivor | Battle purple | `#9B59B6` |
| The Diamond Corpse | Ice blue | `#00D4FF` |
| The Gas Guzzler | ETH gold | `#FFD700` |
| The Chain Hopper | Matrix green | `#00FF88` |
| The Stablecoin Monk | Steel gray | `#8899AA` |
| The Anti-Smart-Money | Hot pink | `#FF69B4` |
| The 3AM Degen | Midnight purple | `#7B68EE` |
| The Exit Liquidity | Tomato red | `#FF6347` |

Per-archetype colors maximize feed variety (when multiple friends share, each card looks different → prevents feed fatigue → increases sharing).

---

## Degen Archetypes

Assigned via **hybrid approach**: rule-based scoring suggests top 2-3 candidate archetypes from on-chain data, then the LLM makes the final call with full context. This catches nuanced combinations while remaining testable.

| Archetype | Trigger | Flavor |
|-----------|---------|--------|
| **The Inverse Indicator** | Every trade is wrong, consistently buys tops/sells bottoms | "Funds should short whatever you buy" |
| **The FOMO Farmer** | Buys tokens 24h+ after they've already pumped | "Always first to be last" |
| **The Rug Survivor** | Got rugged 5+ times, still aping | "Not stupidity, commitment" |
| **The Diamond Corpse** | Held through 95%+ drawdowns | "Not diamond hands. Rigor mortis." |
| **The Gas Guzzler** | Spent more on gas than actual gains | "Ethereum's favorite customer" |
| **The Chain Hopper** | Losing money across 5+ chains | "Diversifying your losses across blockchains" |
| **The Stablecoin Monk** | 90%+ stablecoins, barely trades | "Too scared to buy, too stubborn to leave" |
| **The Anti-Smart-Money** | Consistently opposite of Smart Money | "An inverse ETF in human form" |
| **The 3AM Degen** | Trades at odd hours, high frequency | "Sleep is for people with stop-losses" |
| **The Exit Liquidity** | Buys what Smart Money is selling | "Thank you for your service" |

---

## Roast Categories & Data Sources

Each roast card has 4-5 categories with letter grades (A-F) plus an overall verdict.

| Category | Data Source (Nansen API) | Example Roast |
|----------|--------------------------|---------------|
| **Timing** | `address_transactions` timestamps vs `token_ohlcv` | "You bought TOKEN at the literal ATH. You ARE the top." |
| **P&L** | `wallet_pnl_summary` | "Win rate: 23%. A coin flip would outperform you." |
| **Diversification** | `address_portfolio` | "87% in one token. Not conviction — a hostage situation." |
| **Diamond/Paper Hands** | `address_historical_balances` | "Sold ETH 2 days before it pumped 40%. You're welcome." |
| **Smart Money Score** | `token_who_bought_sold` + `smart_money_token_balances` | "Smart Money sold. You bought. You ARE the exit liquidity." |
| **Degen Level** | `address_transactions` (frequency, timing) | "47 trades at 3AM on a Tuesday. Perfectly normal behavior." |
| **Social** | `address_counterparties` | "Your #1 counterparty is Uniswap. Touch grass: not detected." |
| **Ranking** | `token_pnl_leaderboard` | "Out of 5,000 traders, you ranked #4,872. Bottom 3%." |

---

## Nansen API Call Sequence

~14 calls per roast. Minimum 10 required for hackathon. All calls use the Nansen REST API.

### Two-Phase Parallel Execution

Calls are split into two phases to maximize parallelism while respecting data dependencies. Target: all API calls complete within ~3-5s.

**Phase A — Wallet-level calls (all parallel, no dependencies):**

| # | Endpoint | Credits | Purpose |
|---|----------|---------|---------|
| 1 | `general_search` | 0 | Resolve ENS/address, get basic labels (free — NOT the 500-credit `profiler/labels`) |
| 2 | `wallet_pnl_summary` | 1 | Overall W/L record, win rate |
| 3 | `address_portfolio` | 1 | Current holdings, concentration |
| 4 | `address_transactions` | 1 | Trading patterns, timing, frequency |
| 5 | `address_counterparties` | 5 | Who they interact with |
| 6 | `address_related_addresses` | 1 | Alt wallets, connections |
| 7 | `address_historical_balances` | 1 | Diamond/paper hands detection |

**Phase B — Token-specific calls (all parallel, depend on Phase A results):**

| # | Endpoint | Credits | Purpose | Token Source |
|---|----------|---------|---------|-------------|
| 8 | `wallet_pnl_for_token` | 1 | Detailed P&L for worst trade | Worst loser from #2 |
| 9 | `wallet_pnl_for_token` | 1 | Detailed P&L for 2nd worst | 2nd worst from #2 |
| 10 | `token_ohlcv` | 1 | Price history — ATH detection | Worst loser from #2 |
| 11 | `token_ohlcv` | 1 | More top-buying evidence | 2nd worst from #2 |
| 12 | `token_pnl_leaderboard` | 5 | Ranking vs other traders | Worst loser from #2 |
| 13 | `token_who_bought_sold` | 1 | Smart Money correlation | Worst loser from #2 |
| 14 | `smart_money_token_balances` | 5 | SM holdings comparison | Worst loser from #2 |
| 15 | `token_quant_scores` | 2 | Nansen Score of holdings | Largest holding from #3 |

**Token selection heuristic**: Worst 2 tokens from `wallet_pnl_summary` for roast material. If PnL data insufficient, fall back to largest holdings from `address_portfolio`. Largest single holding used for quant scores.

**Total: ~26 credits per roast = ~$0.026**

### Endpoints we intentionally skip

- `profiler/labels` — 500 credits ($0.50) per call. `general_search` (0 credits) returns basic labels.
- `hyperliquid_leaderboard` — 9 credits, niche use case.

### Error Handling

- Exponential backoff retry: 3 attempts per call (1s → 2s → 4s)
- Error classification: rate limit (429) → backoff, not found (404) → skip gracefully, server error (5xx) → retry
- Partial results: if some Phase B calls fail, generate roast with available data (graceful degradation)

### Sparse Data Handling

| Wallet Activity Level | Behavior |
|----------------------|----------|
| 0-2 transactions | "Too boring to roast" — fun message, suggest trying another wallet |
| 3-10 transactions | Graceful: 2-3 categories only, skip data-heavy ones (Smart Money, timing) |
| 11-50 transactions | Standard: 4 categories, may skip leaderboard ranking |
| 50+ transactions | Full roast: all 5 categories + all data |

---

## Cost Protection

### The problem

If this goes viral, API costs scale linearly with unique roasts.

**Per-roast cost breakdown:**
- Nansen API: ~26 credits = ~$0.026
- Gemini Flash Lite: ~$0.001 (free during testing)
- **Total: ~$0.027/roast**

| Daily Unique Roasts | Daily Cost | Nansen | LLM |
|----------------------|------------|--------|-----|
| 100 | $2.70 | $2.60 | $0.10 |
| 370 | **$10.00** | $9.62 | $0.37 |
| 1,000 | $27 | $26 | $1 |
| 10,000 | $270 | $260 | $10 |

### Strategy: Free + Cached + Rate-Limited + x402 Upgrade

#### Layer 1: Aggressive Caching (biggest cost saver)

- Same wallet address = same roast for 24h
- If someone's roast goes viral and 10,000 people view it, we serve from cache 9,999 times
- **Reduces API costs by 90%+ in viral scenarios**
- Store in SQLite with `{chain}:{address}` as key, 24h TTL
- Cache BOTH raw Nansen API responses AND final roast JSON (enables prompt iteration without re-fetching)

#### Layer 2: Rate Limiting

- Per IP: 3 unique wallet roasts per hour, 10 per day
- Light browser fingerprinting (canvas hash + screen size) as secondary signal
- Per wallet address: 1 fresh roast per 24h (cache)
- Global daily budget cap: configurable via `DAILY_BUDGET_CAP` env var
  - **$10/day** for testing (~385 unique roasts)
  - **$20/day** for live hackathon period
- When cap is hit: hard cutoff — "We're at capacity for today! Come back tomorrow."

#### Layer 3: x402 Premium (stretch goal, not a gate)

- **Never gate the first roast**. Free is non-negotiable for virality.
- Premium features behind x402 ($0.01-0.05 via USDC on Base):
  - "Refresh roast" (bypass 24h cache)
  - "Compare two wallets" (who's the bigger degen?)
  - "Deep analysis" with additional Smart Money data
- Uses `@x402/next` SDK
- Demonstrates crypto-native sophistication for hackathon judges

#### Why free first, x402 second

- 68% of users abandon at "connect wallet" step (before seeing price)
- Only ~10% of crypto Twitter has USDC on Base ready
- Wordware was free -> 8.1M users. WalletRoast.com charges $0.01 -> no evidence of traction.
- Free likely doubles our viral coefficient (K=0.5 -> K=1.0+)

#### Additional cost considerations

- Ask Nansen for sponsored/extended credits (it's their hackathon — our virality benefits them)
- Consider a "Powered by Nansen" badge in exchange for credit support
- Default Nansen plan: $49/mo includes 1,000 starter credits. We'll need more.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 15** (App Router) | API routes + SSR + OG image generation |
| Language | **TypeScript** | Type safety |
| Data fetching | **Nansen REST API** (via `fetch`) | Direct API calls with exponential backoff retry. Two-phase parallel execution. |
| AI roast generation | **Gemini 3.1 Flash Lite** via `@google/generative-ai` (fallback: 2.5 Flash) | Cheapest option ($0.001/roast), free tier for testing, good enough for structured humor with strong prompt. |
| Image generation | **Playwright** (screenshot of internal HTML page) | Full CSS/HTML/Tailwind freedom. Warm browser instance on VPS. ~100-200ms per render with reuse. |
| Caching | **SQLite** via `better-sqlite3` | Raw Nansen data + final roast JSON + PNG paths. 24h TTL. Enables prompt iteration without re-fetching API. |
| Styling | **Tailwind CSS** | Fast iteration, dark mode built-in |
| Deployment | **Hetzner VPS** (Docker + nginx) | Already have one. No added costs. Full server capabilities. |
| Payments (stretch) | **@x402/next** | x402 micropayments for premium features |
| Package manager | **pnpm** | Per project conventions |

### Key Architecture Decisions

- **SQLite, not KV/Redis** — simpler on VPS, stores both raw API data and final roasts for prompt iteration
- **Playwright, not Satori** — full CSS freedom for viral-quality card design (gradients, grain textures, box-shadows, any font)
- **Pre-generate images at roast time** — PNGs stored on disk, served statically. Twitter's crawler gets instant response.
- **API routes handle Nansen calls server-side** — API key never exposed to client
- **OG image route** (`/api/og/[address]`) serves pre-generated PNG (does NOT generate on-the-fly)
- **Results page** (`/roast/[address]`) shows full results + embeds OG image as Twitter Card
- **ENS-aware URLs** — `/roast/vitalik.eth` resolves to same roast as `/roast/0xd8dA...`
- **Auto-detect chain** from address format — no manual chain selector needed

---

## Page Structure

```
/                          Landing page (input box, examples)
/roast/[address]           Results page (roast card + detailed breakdown)
/api/roast/[address]       API: fetch Nansen data, generate roast, return JSON
/api/og/[address]          API: serve pre-generated OG image PNG
/card-render/[address]     Internal: HTML page for Playwright screenshot (not public)
```

### Landing Page

- Dark bg, Spotify Wrapped-inspired bold aesthetic
- Hero: large input box "Paste any wallet address"
- Auto-detect chain from input format (no manual chain selector)
- "Roast Me" CTA button
- Pre-generated example roasts: vitalik.eth + 2-3 famous degens (interactive — click to see full roast)
- Referral context: if `?ref=0xABC`, show "Your friend just got roasted. Your turn."
- Disclaimer footer: "For entertainment only. Not financial advice."
- "Powered by Nansen" badge

### Results Page

**Above the fold (mobile):**
- Roast card image (summary variant, downloadable)
- Share buttons: "Share on X" (primary, largest) | "Telegram" | "Download Image" | "Copy Link"

**Below the fold:**
- Archetype card image (second variant, also downloadable)
- Detailed category breakdown (extended roasts + supporting data)
- Degen archetype with icon, color, and description
- "Roast a Friend" input box with CTA (positioned AFTER share buttons)
- Footer: "Powered by Nansen" + hackathon attribution

### Twitter/X Card Meta Tags

```html
<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:image" content="https://{SITE_URL}/api/og/0xABC..." />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
<meta property="og:title" content="Cookd: 0xABC...DEF" />
<meta property="og:description" content="I'm 'The Inverse Indicator' — The market literally does the opposite of what I do." />
<meta property="og:url" content="https://{SITE_URL}/roast/0xABC..." />
<meta property="og:site_name" content="Cookd" />

<!-- Twitter-specific -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Cookd: 0xABC...DEF" />
<meta name="twitter:description" content="I'm 'The Inverse Indicator' — How cooked are you? cookd.wtf" />
<meta name="twitter:image" content="https://{SITE_URL}/api/og/0xABC..." />
```

**OG image gotchas:**
- Image URL must be absolute (`https://...`), never relative
- Twitter caches OG images ~7 days — append `?v={version}` if needed for cache busting
- `robots.txt` must `Allow: /api/og/*` — Twitter's crawler respects robots.txt
- OG route serves pre-generated PNG from disk (does NOT call Nansen API on request)
- If cache cold (someone shares URL before roast generated), serve generic fallback card

### Share Button Implementation

**"Share on X"** (primary):
```
https://twitter.com/intent/tweet?text={ENCODED_TEXT}&url={ROAST_URL}&hashtags=NansenCLI
```
Pre-filled tweet (under 200 chars):
```
just got cooked 💀

Apparently I'm "{ARCHETYPE}"

"{SHAREABLE_LINE}"

How cooked are you?
```

**"Telegram"**:
```
https://t.me/share/url?url={URL}&text={TEXT}
```

**"Download Image"**: `canvas.toBlob` → anchor download of summary card PNG

**"Copy Link"**: `navigator.clipboard.writeText(url)` + "Copied!" toast

---

## AI Roast Generation

### Model Selection

| Model | Input $/1M | Output $/1M | Cost/Roast | Free Tier | Quality |
|-------|-----------|-------------|------------|-----------|---------|
| **Gemini 3.1 Flash Lite** (primary) | $0.25 | $1.50 | **$0.001** | Yes | Good enough with strong prompt |
| Gemini 2.5 Flash (fallback) | $0.30 | $2.50 | $0.002 | Yes | Better quality, still cheap |
| Claude Sonnet 4.6 (not using) | $3.00 | $15.00 | $0.014 | No | Best quality, 14x more expensive |

**Decision: Gemini 3.1 Flash Lite.** The humor quality lives in the prompt (few-shot examples, tone guidelines), not in the model's raw reasoning ability. We pre-process Nansen data into clear signals ("bought at ATH", "win rate 23%") — the model just turns those into one-liners. If output feels flat, swap to 2.5 Flash (same API, one line change).

Free tier means we pay $0 during development and testing.

### Prompt Strategy

Feed the model structured wallet data (JSON) and generate roasts in a specific format. **Prompt quality is critical** — this is where we invest time instead of money.

**Grading**: Deterministic grades computed from data (fixed thresholds per category, e.g., win_rate < 0.25 → F), passed to the LLM as suggestions. LLM can override by ±1 grade level with justification.

**Time window**: Feed both all-time and recent (30-90 day) data. LLM can highlight trends ("You USED to be bad. Now you're worse.").

**Input:**
```json
{
  "address": "0xd8dA...6045",
  "chains": ["ethereum", "solana"],
  "labels": ["Known: vitalik.eth"],
  "pnl_summary": { "total_realized_pnl": -12500, "win_rate": 0.23, "total_trades": 147 },
  "worst_trades": [
    { "token": "PEPE", "bought_at": 0.0000142, "sold_at": 0.0000031, "loss_pct": -78 }
  ],
  "portfolio": { "top_holding_pct": 87, "top_holding_token": "DOGE", "num_tokens": 34 },
  "timing": { "avg_hour_utc": 3, "bought_tops_count": 14, "sold_bottoms_count": 8 },
  "smart_money_alignment": -0.73,
  "counterparties": { "top": "Uniswap V3 Router", "interaction_count": 412 },
  "suggested_grades": { "timing": "F-", "diversification": "D", "diamond_hands": "C-", "degen_level": "A+" },
  "candidate_archetypes": ["The Inverse Indicator", "The Exit Liquidity", "The FOMO Farmer"]
}
```

**Output (structured JSON):**
```json
{
  "archetype": "The Inverse Indicator",
  "categories": [
    {
      "name": "Timing",
      "grade": "F-",
      "card_roast": "You bought the top 14 times. The market literally uses you as a signal.",
      "detail_roast": "You bought the top 14 times across 7 different tokens. Your average entry is within 2% of the all-time high. At this point, hedge funds should just short whatever you buy — it would be the most consistent alpha in crypto."
    },
    {
      "name": "Diversification",
      "grade": "D",
      "card_roast": "87% in DOGE. That's not a portfolio, that's a shrine.",
      "detail_roast": "87% of your portfolio is in DOGE across 34 tokens. The other 33 tokens are just there to make DOGE feel less lonely. This isn't diversification — it's a hostage situation where DOGE is holding your net worth captive."
    }
  ],
  "verdict": "Your wallet is what happens when someone takes 'buy high, sell low' as actual financial advice.",
  "shareable_line": "Apparently I'm an Inverse Indicator. The market does the opposite of what I do."
}
```

Note: Each category has TWO roast versions — `card_roast` (punchy one-liner for the image card) and `detail_roast` (extended version for the results page breakdown).

### Few-Shot Examples

3-5 fabricated but realistic wallet data + roast pairs included in the system prompt. These are hand-crafted one-time and approved before shipping. They teach the model our specific tone, humor style, and output format. Examples should cover:
1. A terrible trader (mostly F grades) — The Inverse Indicator
2. A diamond hands / bag holder — The Diamond Corpse
3. A hyper-active degen — The 3AM Degen
4. A mostly inactive stablecoin holder — The Stablecoin Monk
5. An edge case: decent trader who still gets roasted on one category

### Prompt Guidelines

- Use structured output (JSON mode) for consistent formatting
- Instruct: no exact dollar amounts, use % and behavioral patterns
- Instruct: always include one flattering element per roast
- Instruct: `card_roast` must be ONE sentence max (fits image card)
- Instruct: `detail_roast` can be 2-3 sentences (for results page)
- Instruct: the verdict should be a single memorable analogy/comparison
- Instruct: reference specific token names, specific behavioral patterns — never generic
- Instruct: grade overrides only ±1 from suggested, with reason
- Fixed medium tone: "mean but not cruel" — the user must WANT to share
- Test extensively; the prompt is the product

---

## Launch Strategy

### Pre-Launch (before submission)

1. Pre-generate roasts for 10-20 well-known wallets (vitalik.eth, famous degens, known whales)
2. Use these as example content on the landing page
3. Prepare tweet thread showing the tool + example roasts

### Launch (submission day)

- Post on X: example roast cards for famous wallets
- Tag @nansen_ai, use #NansenCLI
- Time: Tuesday or Wednesday, 9-10 AM EST (peak Twitter engagement)
- Respond to every reply in the first hour

### Post-Launch

- "Roast a friend" mechanic drives secondary viral loop
- Each shared roast card has URL watermark driving new users
- Monitor costs, adjust daily budget cap as needed

---

## MVP Scope (Hackathon)

### Must Have (ship this)

- [ ] Landing page with wallet input + auto-detect chain
- [ ] Nansen API integration (14+ calls per roast, two-phase parallel)
- [ ] Gemini Flash Lite roast generation (with strong few-shot prompt)
- [ ] Two shareable roast card images via Playwright (summary + archetype)
- [ ] Results page with roast cards + detailed breakdown
- [ ] Twitter Card OG meta tags (auto-embed on share)
- [ ] 24h SQLite caching per wallet (raw API data + final roast)
- [ ] Rate limiting (IP + fingerprint) + daily budget cap
- [ ] "Share on X" + Telegram + Copy Link + Download Image buttons
- [ ] Pre-filled tweet with archetype identity label
- [ ] Mobile-responsive dark mode design (Spotify Wrapped aesthetic)
- [ ] ETH + Base + Solana chain support
- [ ] ENS-aware URLs (`/roast/vitalik.eth`)
- [ ] Pre-generated example roasts on landing page (interactive)
- [ ] Loading state: fake progress bar + rotating witty messages
- [ ] "Roast a Friend" CTA on results page
- [ ] Smart Money alignment as key differentiator
- [ ] Deterministic grading with LLM override (±1)
- [ ] Per-archetype accent colors + icons
- [ ] Disclaimer footer ("For entertainment only")
- [ ] Docker + nginx deployment on Hetzner VPS
- [ ] `robots.txt` allowing `/api/og/*` for Twitter crawler

### Stretch Goals

- [ ] x402 premium features (refresh, compare, deep analysis)
- [ ] Comparison mode ("Who's the bigger degen?" — shareable comparison card)
- [ ] Referral URLs with competitive framing (`?ref=0xABC`)
- [ ] Farcaster share button
- [ ] Degen leaderboard ("Most Roasted Wallets")
- [ ] Animated roast reveal on page load

---

## Open Questions

- [x] Domain name: cookd.wtf
- [ ] Nansen credit allocation: ask for sponsored credits?
- [x] ~~Which model for roasts~~ → Gemini 3.1 Flash Lite via `@google/generative-ai`
- [x] ~~Database vs KV cache~~ → SQLite via `better-sqlite3` (raw API data + roast JSON + PNG paths, 24h TTL)
- [x] ~~Legal~~ → Disclaimer ("For entertainment only, not financial advice"). No removal mechanism. All data is public blockchain data.
- [x] ~~Image generation tech~~ → Playwright screenshot on VPS (full CSS freedom)
- [x] ~~Deployment target~~ → Hetzner VPS (Docker + nginx), not Vercel
- [ ] SSL/HTTPS setup: configure Let's Encrypt once domain purchased

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Hetzner VPS                     │
│                                                  │
│  ┌──────────┐    ┌───────────────────────────┐  │
│  │  nginx   │───▶│  Next.js 15 (App Router)  │  │
│  │  :443    │    │  :3000                     │  │
│  └──────────┘    │                            │  │
│                  │  /                 Landing  │  │
│                  │  /roast/[address]  Results  │  │
│                  │  /api/roast/[addr] API      │  │
│                  │  /api/og/[addr]    OG PNG   │  │
│                  └─────────┬─────────────────┘  │
│                            │                     │
│            ┌───────────────┼───────────────┐    │
│            ▼               ▼               ▼    │
│    ┌──────────┐   ┌──────────────┐  ┌────────┐ │
│    │ SQLite   │   │  Playwright  │  │ Static  │ │
│    │ Cache DB │   │  (warm inst) │  │ /images │ │
│    └──────────┘   └──────────────┘  └────────┘ │
│                                                  │
└─────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
  ┌─────────────┐    ┌──────────────┐
  │ Nansen API  │    │  Gemini API  │
  └─────────────┘    └──────────────┘
```

---

## Project Structure

```
nansen-ai/
├── app/
│   ├── layout.tsx                   # Root layout (dark mode, fonts, meta)
│   ├── page.tsx                     # Landing page (input, examples)
│   ├── roast/
│   │   └── [address]/
│   │       └── page.tsx             # Results page (card, breakdown, share)
│   ├── api/
│   │   ├── roast/
│   │   │   └── [address]/
│   │   │       └── route.ts         # Main roast API (Nansen + Gemini)
│   │   └── og/
│   │       └── [address]/
│   │           └── route.ts         # Serve pre-generated PNG
│   └── card-render/
│       └── [address]/
│           └── page.tsx             # Internal: HTML card for Playwright screenshot
├── lib/
│   ├── nansen/
│   │   ├── client.ts               # Nansen API client (auth, retry, base URL)
│   │   ├── endpoints.ts            # Individual endpoint wrappers
│   │   ├── types.ts                # Response types for all endpoints
│   │   └── data-processor.ts       # Transform raw API data → roast input signals
│   ├── roast/
│   │   ├── generator.ts            # Gemini prompt + few-shot + structured output
│   │   ├── archetypes.ts           # 10 archetypes: rules, colors, icons, descriptions
│   │   ├── grading.ts              # Deterministic grade computation per category
│   │   └── types.ts                # RoastResult, Category, Archetype types
│   ├── image/
│   │   ├── renderer.ts             # Playwright screenshot → PNG
│   │   └── storage.ts              # Save/retrieve PNGs from disk
│   ├── cache/
│   │   ├── db.ts                   # SQLite setup (better-sqlite3)
│   │   └── queries.ts              # Get/set raw API data, roast results, TTL
│   ├── rate-limit/
│   │   └── limiter.ts              # IP + fingerprint rate limiting
│   ├── budget/
│   │   └── tracker.ts              # Daily credit usage tracking + configurable cap
│   └── utils/
│       ├── address.ts              # Validate + auto-detect chain from address format
│       └── ens.ts                  # ENS resolution via general_search
├── components/
│   ├── WalletInput.tsx             # Address input + auto-detect chain
│   ├── RoastCard.tsx               # Client-side card display component
│   ├── ShareButtons.tsx            # Twitter + Telegram + Copy Link + Download
│   ├── LoadingState.tsx            # Fake progress bar + witty messages
│   ├── CategoryBreakdown.tsx       # Detailed per-category view (below fold)
│   ├── ArchetypeBadge.tsx          # Archetype display with icon + color
│   └── ExampleRoasts.tsx           # Landing page pre-generated examples
├── public/
│   ├── fonts/
│   │   ├── SpaceGrotesk-Bold.ttf
│   │   └── Inter-Regular.ttf
│   ├── images/                     # Generated roast card PNGs (cached)
│   └── robots.txt                  # Allow: /api/og/*
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
├── .env.example
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Environment Variables

```env
NANSEN_API_KEY=              # Nansen REST API key
GEMINI_API_KEY=              # Google AI / Gemini API key
DAILY_BUDGET_CAP=10          # Daily Nansen credit budget in dollars (adjustable)
SITE_NAME=cookd.wtf    # Placeholder until domain decided
SITE_URL=https://cookd.wtf
NODE_ENV=production
```

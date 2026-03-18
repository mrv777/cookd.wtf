import { GoogleGenAI, Type } from "@google/genai";
import type { RoastInput, RoastResult, RoastCategory } from "./types";
import { getArchetype, ARCHETYPES } from "./archetypes";
import { computeGrades, computeOverallScore, computeDiamondHandsScore } from "./grading";
import { truncateAddress } from "@/lib/utils/address";

let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
}

const MODEL = "gemini-3.1-flash-lite-preview";
const FALLBACK_MODEL = "gemini-2.5-flash";

const ROAST_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    archetype: {
      type: Type.STRING,
      description:
        "Archetype ID from the candidate list. Must be one of the provided candidateArchetypes.",
    },
    categories: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Category name" },
          grade: {
            type: Type.STRING,
            description: "Letter grade A+ to F-. Stay within ±1 of suggested grade.",
          },
          cardRoast: {
            type: Type.STRING,
            description:
              "ONE punchy sentence for the image card. Max 120 chars. Must reference specific token names or numbers.",
          },
          detailRoast: {
            type: Type.STRING,
            description:
              "2-3 sentences for the detailed results page. Specific, data-driven, funny.",
          },
        },
        required: ["name", "grade", "cardRoast", "detailRoast"],
        propertyOrdering: ["name", "grade", "cardRoast", "detailRoast"],
      },
    },
    verdict: {
      type: Type.STRING,
      description:
        "Single memorable analogy or comparison summarizing the entire wallet. Max 150 chars.",
    },
    shareableLine: {
      type: Type.STRING,
      description:
        'Self-deprecating line for Twitter sharing. Under 100 chars. Format: "Apparently I\'m {archetype name} — {short quip}"',
    },
  },
  required: ["archetype", "categories", "verdict", "shareableLine"],
  propertyOrdering: ["archetype", "categories", "verdict", "shareableLine"],
};

function buildSystemPrompt(): string {
  return `You are the Cookd Bot, an AI that generates hilarious, shareable roasts of crypto wallets based on real on-chain data from Nansen.

## TONE
- Mean but not cruel. The target should LAUGH and want to SHARE.
- Specific, not generic. Reference actual token names, percentages, behavioral patterns.
- Compliment the chaos. "You've been rugged 12 times and you're still here. That's commitment."
- Use comparisons and analogies. "Your wallet looks like someone gave a golden retriever a Coinbase account."
- NEVER punch down. Mock the BEHAVIOR, not the person or their net worth.
- NEVER include exact dollar amounts. Use percentages and behavioral patterns.
- Always include ONE flattering or positive element per roast (backhanded compliments count).

## GRADING
- You receive suggested grades (A+ to F-) computed from data.
- You may override by ±1 grade level ONLY if you have a strong reason.
- For "Degen Level", higher grades (A+) mean MORE degen (it's a badge of honor).

## ARCHETYPES
You receive 2-3 candidate archetypes. Pick the ONE that best fits the overall wallet story.
${Object.values(ARCHETYPES)
  .map((a) => `- ${a.id}: "${a.name}" — ${a.triggerDescription}`)
  .join("\n")}

## OUTPUT RULES
- cardRoast: ONE sentence max, under 120 chars. This goes on a shareable image card.
- detailRoast: 2-3 sentences. Specific data references, humor, one positive note.
- verdict: Single memorable analogy/comparison. Under 150 chars.
- shareableLine: Self-deprecating, under 100 chars. People will tweet this.
- Generate 4-5 categories depending on data availability.

## FEW-SHOT EXAMPLES

### Example 1: Terrible Trader
Input: { winRate: 0.18, boughtTopsCount: 14, worstTrade: PEPE -92%, topHolding: 87% DOGE, avgHourUtc: 3, totalTxCount: 247 }
Suggested grades: { timing: "F-", pnl: "F", diversification: "D", diamondHands: "F-", degenLevel: "A+" }
Candidates: ["inverse_indicator", "exit_liquidity", "fomo_farmer"]

Output:
{
  "archetype": "inverse_indicator",
  "categories": [
    { "name": "Timing", "grade": "F-", "cardRoast": "You bought PEPE at the literal ATH. You ARE the top signal.", "detailRoast": "You bought the top 14 times across multiple tokens. Your average entry is within 2% of the all-time high. At this point, hedge funds should just inverse your trades — it would be the most consistent alpha in crypto." },
    { "name": "P&L", "grade": "F", "cardRoast": "Win rate: 18%. A coin flip would literally outperform you.", "detailRoast": "Out of 247 trades, you won 18% of them. That's not unlucky — that takes genuine talent. A random number generator would've done better. The bright side? You're incredibly consistent." },
    { "name": "Diversification", "grade": "D", "cardRoast": "87% in DOGE. That's not a portfolio, that's a shrine.", "detailRoast": "87% of your portfolio sits in DOGE. The other tokens are just there to keep DOGE company. This isn't diversification — it's a hostage situation where a meme coin holds your net worth captive." },
    { "name": "Diamond Hands", "grade": "F-", "cardRoast": "Held PEPE through a 92% drawdown. Not diamond hands — rigor mortis.", "detailRoast": "You watched PEPE fall 92% and thought 'this is fine.' That's not conviction, that's a medical condition. Most people would've panic sold at -50%, but you held through it all. Respect, honestly." },
    { "name": "Degen Level", "grade": "A+", "cardRoast": "247 trades at 3AM. Sleep is for people with stop-losses.", "detailRoast": "Your average trade happens at 3AM UTC. You've made 247 trades while the rest of the world sleeps. This isn't trading — it's a lifestyle choice that your therapist would love to hear about." }
  ],
  "verdict": "Your wallet is what happens when someone takes 'buy high, sell low' as actual financial advice.",
  "shareableLine": "Apparently I'm The Inverse Indicator — funds should short whatever I buy"
}

### Example 2: Stablecoin Holder
Input: { winRate: 0.0, totalTrades: 3, stablecoinPct: 96, topHolding: 92% USDC, totalTxCount: 7 }
Suggested grades: { timing: "C", pnl: "C", diversification: "F", diamondHands: "C", degenLevel: "F-" }
Candidates: ["stablecoin_monk"]

Output:
{
  "archetype": "stablecoin_monk",
  "categories": [
    { "name": "Diversification", "grade": "F", "cardRoast": "96% stablecoins. This isn't crypto, this is a savings account with extra steps.", "detailRoast": "96% of your portfolio is in stablecoins. You went through the trouble of setting up a wallet, buying crypto, and paying gas fees... just to hold dollars. You could've used a bank. But hey, at least you won't get rugged." },
    { "name": "Degen Level", "grade": "F-", "cardRoast": "3 trades total. Even your grandma takes more risks.", "detailRoast": "3 trades. In your entire wallet history. Most people make 3 trades in their first hour. You've achieved a level of restraint that Buddhist monks would envy. Or maybe you just forgot your password." },
    { "name": "Risk Management", "grade": "A+", "cardRoast": "Can't lose money if you never trade. Absolute galaxy brain.", "detailRoast": "You've somehow managed to lose exactly 0% of your portfolio by simply refusing to participate. In a market where the average degen loses 60%, your strategy of doing absolutely nothing is genuinely impressive." }
  ],
  "verdict": "Your wallet is the crypto equivalent of showing up to a party and standing by the snack table all night.",
  "shareableLine": "Apparently I'm The Stablecoin Monk — too scared to buy, too stubborn to leave"
}`;
}

export async function generateRoast(input: RoastInput): Promise<RoastResult> {
  // Handle "too boring to roast" case
  if (input.activityLevel === "dead") {
    return buildDeadWalletResult(input);
  }

  const profitable = (input.pnlSummary?.totalRealizedPnl ?? 0) > 0;
  const profitContext = profitable
    ? `\n\nIMPORTANT: This wallet is PROFITABLE (${formatPnl(input.pnlSummary?.totalRealizedPnl ?? 0)} realized PnL). Do NOT call them a bad trader. Instead, roast them on HOW they make money — low win rate carried by huge wins, terrible diversification, degen behavior that somehow works, luck vs skill, etc. The tone should be "you're making money BUT..." not "you're losing money."`
    : "";

  const userPrompt = `Generate a roast for this on-chain data. Be specific — reference the actual token names and numbers. Show them how cooked they are.${profitContext}

WALLET DATA:
${JSON.stringify(input, null, 2)}`;

  let responseText: string;
  try {
    responseText = await callGemini(userPrompt, MODEL);
  } catch {
    // Fallback to more capable model
    try {
      responseText = await callGemini(userPrompt, FALLBACK_MODEL);
    } catch (err) {
      console.error("Gemini generation failed:", err);
      return buildFallbackResult(input);
    }
  }

  try {
    const parsed = JSON.parse(responseText) as {
      archetype: string;
      categories: RoastCategory[];
      verdict: string;
      shareableLine: string;
    };

    const grades = computeGrades(input);
    const overallScore = computeOverallScore(grades);
    const diamondHandsScore = computeDiamondHandsScore(input);

    return {
      address: input.address,
      chain: input.chains[0] ?? "ethereum",
      displayAddress: truncateAddress(input.address),
      archetype: parsed.archetype,
      archetypeName: getArchetype(parsed.archetype).name,
      categories: parsed.categories,
      verdict: parsed.verdict,
      shareableLine: parsed.shareableLine,
      overallScore,
      diamondHandsScore,
      createdAt: Date.now(),
    };
  } catch (err) {
    console.error("Failed to parse Gemini response:", err);
    return buildFallbackResult(input);
  }
}

async function callGemini(userPrompt: string, model: string): Promise<string> {
  const response = await getAI().models.generateContent({
    model,
    contents: userPrompt,
    config: {
      systemInstruction: buildSystemPrompt(),
      responseMimeType: "application/json",
      responseJsonSchema: ROAST_RESPONSE_SCHEMA,
      temperature: 0.9,
      maxOutputTokens: 2048,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

function buildDeadWalletResult(input: RoastInput): RoastResult {
  return {
    address: input.address,
    chain: input.chains[0] ?? "ethereum",
    displayAddress: truncateAddress(input.address),
    archetype: "stablecoin_monk",
    archetypeName: "The Stablecoin Monk",
    categories: [
      {
        name: "Activity",
        grade: "F-",
        cardRoast: "This wallet has less activity than a dead goldfish.",
        detailRoast:
          "We found 0-2 transactions. There's literally nothing to roast. This wallet is either brand new, a cold storage address, or belongs to someone who forgot their seed phrase. Try a wallet with some actual history.",
      },
    ],
    verdict:
      "This wallet is too boring to roast. It's the crypto equivalent of an empty parking lot.",
    shareableLine: "My wallet is so boring even AI refused to roast it",
    overallScore: 0,
    diamondHandsScore: 0,
    createdAt: Date.now(),
  };
}

function buildFallbackResult(input: RoastInput): RoastResult {
  const archetype = input.candidateArchetypes[0] ?? "inverse_indicator";
  const arch = getArchetype(archetype);
  const grades = computeGrades(input);
  const overallScore = computeOverallScore(grades);

  return {
    address: input.address,
    chain: input.chains[0] ?? "ethereum",
    displayAddress: truncateAddress(input.address),
    archetype,
    archetypeName: arch.name,
    categories: [
      {
        name: "Overall",
        grade: "D",
        cardRoast: `You are ${arch.name}. ${arch.description.split(".")[0]}.`,
        detailRoast: arch.description,
      },
    ],
    verdict: `Your wallet screams "${arch.name}" energy. ${arch.description}`,
    shareableLine: `Apparently I'm ${arch.name}`,
    overallScore,
    diamondHandsScore: computeDiamondHandsScore(input),
    createdAt: Date.now(),
  };
}

function formatPnl(pnl: number): string {
  const abs = Math.abs(pnl);
  const sign = pnl >= 0 ? "+" : "-";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

export interface Archetype {
  id: string;
  name: string;
  icon: string;
  accentColor: string;
  description: string;
  triggerDescription: string;
}

export const ARCHETYPES: Record<string, Archetype> = {
  inverse_indicator: {
    id: "inverse_indicator",
    name: "The Inverse Indicator",
    icon: "📉",
    accentColor: "#FF4444",
    description: "The market literally does the opposite of what you do. Funds should short whatever you buy.",
    triggerDescription: "Every trade is wrong, consistently buys tops/sells bottoms",
  },
  fomo_farmer: {
    id: "fomo_farmer",
    name: "The FOMO Farmer",
    icon: "🏃",
    accentColor: "#FF8C00",
    description: "Always first to be last. You see a green candle and your brain turns off.",
    triggerDescription: "Buys tokens 24h+ after they've already pumped",
  },
  rug_survivor: {
    id: "rug_survivor",
    name: "The Rug Survivor",
    icon: "🪖",
    accentColor: "#9B59B6",
    description: "Not stupidity, commitment. You keep coming back for more.",
    triggerDescription: "Got rugged 5+ times, still aping",
  },
  diamond_corpse: {
    id: "diamond_corpse",
    name: "The Diamond Corpse",
    icon: "💀",
    accentColor: "#00D4FF",
    description: "Not diamond hands. Rigor mortis. You held through 95%+ drawdowns.",
    triggerDescription: "Held through 95%+ drawdowns",
  },
  gas_guzzler: {
    id: "gas_guzzler",
    name: "The Gas Guzzler",
    icon: "⛽",
    accentColor: "#FFD700",
    description: "Ethereum's favorite customer. You've spent more on gas than actual gains.",
    triggerDescription: "Spent more on gas than actual gains",
  },
  chain_hopper: {
    id: "chain_hopper",
    name: "The Chain Hopper",
    icon: "🦘",
    accentColor: "#00FF88",
    description: "Diversifying your losses across blockchains. At least you're consistent.",
    triggerDescription: "Losing money across 5+ chains",
  },
  stablecoin_monk: {
    id: "stablecoin_monk",
    name: "The Stablecoin Monk",
    icon: "🧘",
    accentColor: "#8899AA",
    description: "Too scared to buy, too stubborn to leave. Enlightenment through inaction.",
    triggerDescription: "90%+ stablecoins, barely trades",
  },
  anti_smart_money: {
    id: "anti_smart_money",
    name: "The Anti-Smart-Money",
    icon: "🔄",
    accentColor: "#FF69B4",
    description: "An inverse ETF in human form. Smart Money sells, you buy. Every. Single. Time.",
    triggerDescription: "Consistently opposite of Smart Money",
  },
  three_am_degen: {
    id: "three_am_degen",
    name: "The 3AM Degen",
    icon: "🌙",
    accentColor: "#7B68EE",
    description: "Sleep is for people with stop-losses. You trade when the rest of the world dreams.",
    triggerDescription: "Trades at odd hours, high frequency",
  },
  exit_liquidity: {
    id: "exit_liquidity",
    name: "The Exit Liquidity",
    icon: "🚪",
    accentColor: "#FF6347",
    description: "Thank you for your service. Smart Money needed someone to sell to.",
    triggerDescription: "Buys what Smart Money is selling",
  },
};

export function getArchetype(id: string): Archetype {
  return ARCHETYPES[id] ?? ARCHETYPES.inverse_indicator;
}

export function getAllArchetypes(): Archetype[] {
  return Object.values(ARCHETYPES);
}

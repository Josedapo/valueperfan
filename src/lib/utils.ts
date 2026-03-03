import exchangeRate from "../data/exchange-rate.json";

const EUR_TO_USD: number = exchangeRate.rate;

export function formatCurrency(value: number): string {
  const usd = value * EUR_TO_USD;
  if (usd >= 1_000_000) {
    return `$${(usd / 1_000_000).toFixed(1)}M`;
  }
  if (usd >= 1_000) {
    return `$${(usd / 1_000).toFixed(1)}K`;
  }
  return `$${usd.toFixed(0)}`;
}

export function formatVPF(value: number): string {
  const usd = value * EUR_TO_USD * 1000;
  return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatFollowers(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

export function platformUrl(
  platform: "instagram" | "tiktok",
  handle: string
): string {
  if (platform === "tiktok") {
    return `https://www.tiktok.com/@${handle}`;
  }
  return `https://www.instagram.com/${handle}/`;
}

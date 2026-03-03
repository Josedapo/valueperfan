export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `€${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `€${(value / 1_000).toFixed(1)}K`;
  }
  return `€${value.toFixed(0)}`;
}

export function formatVPF(value: number): string {
  if (value >= 1) {
    return `€${value.toFixed(2)}`;
  }
  return `€${value.toFixed(4)}`;
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

export function platformIcon(platform: "instagram" | "tiktok"): string {
  return platform === "instagram" ? "📷" : "🎵";
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

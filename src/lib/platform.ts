export type Platform = "instagram" | "tiktok";

export type Metric = "vpf" | "totalValue";

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
};

const PLATFORM_URLS: Record<Platform, (handle: string) => string> = {
  instagram: (handle) => `https://www.instagram.com/${handle}/`,
  tiktok: (handle) => `https://www.tiktok.com/@${handle}`,
};

export function platformLabel(platform: Platform): string {
  return PLATFORM_LABELS[platform];
}

export function platformProfileUrl(platform: Platform, handle: string): string {
  return PLATFORM_URLS[platform](handle);
}

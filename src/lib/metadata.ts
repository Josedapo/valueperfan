import type { Metadata } from "next";
import type { Platform } from "./platform";

export function buildRankingMetadata({
  locale,
  title,
  description,
  path,
  page = 1,
  totalPages,
  platform = "instagram",
}: {
  locale: string;
  title: string;
  description: string;
  path: string;
  page?: number;
  totalPages?: number;
  platform?: Platform;
}): Metadata {
  const params = new URLSearchParams();
  if (platform === "tiktok") params.set("platform", "tiktok");
  if (page > 1) params.set("page", String(page));
  const suffix = params.size > 0 ? `?${params.toString()}` : "";

  // Canonical drops ?page=N so paginated ranking pages consolidate into page 1.
  // ?platform=tiktok is preserved because it represents a distinct ranking dimension.
  const canonicalParams = new URLSearchParams();
  if (platform === "tiktok") canonicalParams.set("platform", "tiktok");
  const canonicalSuffix =
    canonicalParams.size > 0 ? `?${canonicalParams.toString()}` : "";

  const localePath = locale === "en" ? "" : `/${locale}`;
  // Normalize "/" to "" for locale paths to avoid trailing slash redirects (308)
  const normalizedPath = path === "/" ? "" : path;
  const url = `https://valueperfan.com${localePath}${normalizedPath}${suffix}`;
  const canonicalUrl = `https://valueperfan.com${localePath}${normalizedPath}${canonicalSuffix}`;

  let displayTitle = title;
  if (platform === "tiktok") displayTitle = `${displayTitle} — TikTok`;
  if (page > 1) displayTitle = `${displayTitle} — Page ${page}`;
  // Keep under 70 chars total after layout template adds " | ValuePerFan" (15 chars)
  if (displayTitle.length > 55) displayTitle = `${displayTitle.slice(0, 52)}…`;

  return {
    title: displayTitle,
    description,
    openGraph: {
      title: displayTitle,
      description,
      url,
      siteName: "ValuePerFan",
      type: "website",
      images: [{ url: "https://valueperfan.com/images/brand/vpf-positive-color.png" }],
    },
    twitter: { card: "summary" as const, title: displayTitle, description },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `https://valueperfan.com${normalizedPath || "/"}${canonicalSuffix}`,
        es: `https://valueperfan.com/es${normalizedPath}${canonicalSuffix}`,
        "pt-BR": `https://valueperfan.com/br${normalizedPath}${canonicalSuffix}`,
        "x-default": `https://valueperfan.com${normalizedPath || "/"}${canonicalSuffix}`,
      },
    },
  };
}

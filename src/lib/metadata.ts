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

  const localePath = locale === "en" ? "" : `/${locale}`;
  const url = `https://valueperfan.com${localePath}${path}${suffix}`;

  let displayTitle = title;
  if (platform === "tiktok") displayTitle = `${displayTitle} — TikTok`;
  if (page > 1) displayTitle = `${displayTitle} — Page ${page}`;
  if (displayTitle.length > 60) displayTitle = `${displayTitle.slice(0, 57)}…`;

  return {
    title: displayTitle,
    description,
    openGraph: { title: displayTitle, description, url, siteName: "ValuePerFan" },
    twitter: { card: "summary" as const, title: displayTitle, description },
    alternates: {
      canonical: url,
      languages: {
        en: `https://valueperfan.com${path}${suffix}`,
        es: `https://valueperfan.com/es${path}${suffix}`,
        "pt-BR": `https://valueperfan.com/br${path}${suffix}`,
      },
    },
  };
}

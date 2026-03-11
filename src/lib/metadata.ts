import type { Metadata } from "next";

export function buildRankingMetadata({
  locale,
  title,
  description,
  path,
  page = 1,
  totalPages,
}: {
  locale: string;
  title: string;
  description: string;
  path: string;
  page?: number;
  totalPages?: number;
}): Metadata {
  const suffix = page > 1 ? `?page=${page}` : "";
  const localePath = locale === "en" ? "" : `/${locale}`;
  const url = `https://valueperfan.com${localePath}${path}${suffix}`;
  const displayTitle = page > 1 ? `${title} — Page ${page}` : title;

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
        "x-default": `https://valueperfan.com${path}${suffix}`,
      },
    },
  };
}

import type { Metadata } from "next";

export function buildRankingMetadata({
  locale,
  title,
  description,
  path,
}: {
  locale: string;
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = `https://valueperfan.com${locale === "en" ? "" : `/${locale}`}${path}`;

  return {
    title,
    description,
    openGraph: { title, description, url, siteName: "ValuePerFan" },
    twitter: { card: "summary" as const, title, description },
    alternates: {
      canonical: url,
      languages: {
        en: `https://valueperfan.com${path}`,
        es: `https://valueperfan.com/es${path}`,
        "pt-BR": `https://valueperfan.com/br${path}`,
      },
    },
  };
}

import type { MetadataRoute } from "next";
import { getAccountsData } from "../lib/data";
import { getCategorySlugs } from "../lib/categories";

const BASE_URL = "https://valueperfan.com";

function localizedUrl(path: string, locale: string): string {
  return locale === "en"
    ? `${BASE_URL}${path}`
    : `${BASE_URL}/${locale}${path}`;
}

function withAlternates(path: string) {
  return {
    url: localizedUrl(path, "en"),
    alternates: {
      languages: {
        en: localizedUrl(path, "en"),
        es: localizedUrl(path, "es"),
        "pt-BR": localizedUrl(path, "br"),
      },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const data = getAccountsData();

  const accountUrls = data.accounts.map((account) => ({
    ...withAlternates(`/account/${account.platform}/${account.slug}`),
    lastModified: new Date(data.meta.lastUpdated),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const categoryUrls = getCategorySlugs().map(({ slug }) => ({
    ...withAlternates(`/ranking/${slug}`),
    lastModified: new Date(data.meta.lastUpdated),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [
    {
      ...withAlternates("/"),
      lastModified: new Date(data.meta.lastUpdated),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    ...categoryUrls,
    ...accountUrls,
  ];
}

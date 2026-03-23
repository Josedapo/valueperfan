import type { MetadataRoute } from "next";
import { getAccountsData } from "../lib/data";
import { getCountries } from "../lib/countries";
import { getCategories, getCategoryCountries } from "../lib/categories";
import { BASE_URL } from "../lib/config";

function localizedUrl(path: string, locale: string): string {
  // Normalize "/" to "" for non-default locales to avoid trailing slash redirects (308)
  const normalizedPath = path === "/" && locale !== "en" ? "" : path;
  return locale === "en"
    ? `${BASE_URL}${normalizedPath}`
    : `${BASE_URL}/${locale}${normalizedPath}`;
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

  const lastMod = new Date(data.meta.lastUpdated);

  const countryUrls = getCountries().flatMap(({ slug }) => [
    {
      ...withAlternates(`/ranking/${slug}`),
      lastModified: lastMod,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      ...withAlternates(`/ranking/${slug}?platform=tiktok`),
      lastModified: lastMod,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ]);

  const categories = getCategories();
  const categoryUrls = categories.flatMap(({ slug }) => [
    {
      ...withAlternates(`/ranking/topic/${slug}`),
      lastModified: lastMod,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      ...withAlternates(`/ranking/topic/${slug}?platform=tiktok`),
      lastModified: lastMod,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ]);

  const categoryCountryUrls = categories.flatMap((cat) =>
    getCategoryCountries(cat.name).flatMap((country) => [
      {
        ...withAlternates(`/ranking/topic/${cat.slug}/${country.slug}`),
        lastModified: lastMod,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        ...withAlternates(`/ranking/topic/${cat.slug}/${country.slug}?platform=tiktok`),
        lastModified: lastMod,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
    ])
  );

  return [
    {
      ...withAlternates("/"),
      lastModified: new Date(data.meta.lastUpdated),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    ...countryUrls,
    ...categoryUrls,
    ...categoryCountryUrls,
    ...accountUrls,
  ];
}

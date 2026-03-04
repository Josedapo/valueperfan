import type { MetadataRoute } from "next";
import { getAccountsData } from "../lib/data";
import { getCategorySlugs } from "../lib/categories";

const BASE_URL = "https://valueperfan.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const data = getAccountsData();

  const accountUrls = data.accounts.map((account) => ({
    url: `${BASE_URL}/account/${account.platform}/${account.slug}`,
    lastModified: new Date(data.meta.lastUpdated),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const categoryUrls = getCategorySlugs().map(({ slug }) => ({
    url: `${BASE_URL}/ranking/${slug}`,
    lastModified: new Date(data.meta.lastUpdated),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(data.meta.lastUpdated),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    ...categoryUrls,
    ...accountUrls,
  ];
}

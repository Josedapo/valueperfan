import type { MetadataRoute } from "next";
import { getAccountsData } from "../lib/data";
import { getCountries } from "../lib/countries";
import { getCategories, getCategoryCountries } from "../lib/categories";
import { BASE_URL } from "../lib/config";

const LOCALES = ["en", "es", "br"] as const;

function localizedUrl(path: string, locale: string): string {
  // Normalize "/" to "" for non-default locales to avoid trailing slash redirects (308)
  const normalizedPath = path === "/" && locale !== "en" ? "" : path;
  return locale === "en"
    ? `${BASE_URL}${normalizedPath}`
    : `${BASE_URL}/${locale}${normalizedPath}`;
}

// Generate one sitemap entry per locale, each with full hreflang alternates + x-default.
// This ensures every locale URL has its own <url> entry (not just as an alternate reference).
function localizedEntries(
  path: string,
  props: {
    lastModified: Date;
    changeFrequency:
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never";
    priority: number;
  }
): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {
    "x-default": localizedUrl(path, "en"),
    en: localizedUrl(path, "en"),
    es: localizedUrl(path, "es"),
    "pt-BR": localizedUrl(path, "br"),
  };

  return LOCALES.map((locale) => ({
    url: localizedUrl(path, locale),
    alternates: { languages },
    ...props,
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const data = getAccountsData();
  const lastMod = new Date(data.meta.lastUpdated);

  const homepageUrls = localizedEntries("/", {
    lastModified: lastMod,
    changeFrequency: "weekly",
    priority: 1.0,
  });

  const staticUrls = ["/about", "/contact", "/methodology"].flatMap((path) =>
    localizedEntries(path, {
      lastModified: lastMod,
      changeFrequency: "monthly",
      priority: 0.5,
    })
  );

  const toolUrls = [
    "/tools/social-media-value-calculator",
    "/tools/earned-media-value-calculator",
    "/tools/instagram-account-value-calculator",
    "/tools/tiktok-account-value-calculator",
    "/tools/instagram-engagement-rate-calculator",
    "/tools/tiktok-engagement-rate-calculator",
  ].flatMap((path) =>
    localizedEntries(path, {
      lastModified: lastMod,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  const countryUrls = getCountries().flatMap(({ slug }) => [
    ...localizedEntries(`/ranking/${slug}`, {
      lastModified: lastMod,
      changeFrequency: "weekly",
      priority: 0.9,
    }),
    ...localizedEntries(`/ranking/${slug}?platform=tiktok`, {
      lastModified: lastMod,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  ]);

  const categories = getCategories();
  const categoryUrls = categories.flatMap(({ slug }) => [
    ...localizedEntries(`/ranking/topic/${slug}`, {
      lastModified: lastMod,
      changeFrequency: "weekly",
      priority: 0.9,
    }),
    ...localizedEntries(`/ranking/topic/${slug}?platform=tiktok`, {
      lastModified: lastMod,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  ]);

  const categoryCountryUrls = categories.flatMap((cat) =>
    getCategoryCountries(cat.name).flatMap((country) => [
      ...localizedEntries(`/ranking/topic/${cat.slug}/${country.slug}`, {
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: 0.8,
      }),
      ...localizedEntries(
        `/ranking/topic/${cat.slug}/${country.slug}?platform=tiktok`,
        {
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.7,
        }
      ),
    ])
  );

  const accountUrls = data.accounts.flatMap((account) =>
    localizedEntries(`/account/${account.platform}/${account.slug}`, {
      lastModified: lastMod,
      changeFrequency: "monthly",
      priority: 0.8,
    })
  );

  return [
    ...homepageUrls,
    ...staticUrls,
    ...toolUrls,
    ...countryUrls,
    ...categoryUrls,
    ...categoryCountryUrls,
    ...accountUrls,
  ];
}

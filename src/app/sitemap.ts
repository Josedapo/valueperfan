import type { MetadataRoute } from "next";
import {
  getAccountsData,
  getAccountsByCountryAndPlatform,
  getAccountsByCategoryAndPlatform,
  getAccountsByCategoryCountryAndPlatform,
} from "../lib/data";
import { getCountries } from "../lib/countries";
import { getCategories, getCategoryCountries } from "../lib/categories";
import { BASE_URL, SITEMAP_MIN_TIKTOK_ACCOUNTS } from "../lib/config";

const LOCALES = ["en", "es", "br"] as const;

function localizedUrl(path: string, locale: string): string {
  // Normalize "/" to "" for non-default locales to avoid trailing slash redirects (308)
  const normalizedPath = path === "/" && locale !== "en" ? "" : path;
  return locale === "en"
    ? `${BASE_URL}${normalizedPath}`
    : `${BASE_URL}/${locale}${normalizedPath}`;
}

// Generate one sitemap entry per locale, each with full hreflang alternates.
// This ensures every locale URL has its own <url> entry (not just as an alternate reference).
// Note: <priority> and <changefreq> are intentionally omitted — Google ignores both.
function localizedEntries(
  path: string,
  props: {
    lastModified: Date;
  }
): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {
    en: localizedUrl(path, "en"),
    es: localizedUrl(path, "es"),
    "pt-BR": localizedUrl(path, "br"),
    "x-default": localizedUrl(path, "en"),
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

  const homepageUrls = localizedEntries("/", { lastModified: lastMod });

  const staticUrls = ["/about", "/contact", "/methodology"].flatMap((path) =>
    localizedEntries(path, { lastModified: lastMod })
  );

  const toolUrls = [
    "/tools/social-media-value-calculator",
    "/tools/earned-media-value-calculator",
    "/tools/instagram-account-value-calculator",
    "/tools/tiktok-account-value-calculator",
    "/tools/instagram-engagement-rate-calculator",
    "/tools/tiktok-engagement-rate-calculator",
  ].flatMap((path) => localizedEntries(path, { lastModified: lastMod }));

  const countryUrls = getCountries().flatMap(({ name, slug }) => {
    const entries = localizedEntries(`/ranking/${slug}`, { lastModified: lastMod });
    if (getAccountsByCountryAndPlatform(name, "tiktok").length >= SITEMAP_MIN_TIKTOK_ACCOUNTS) {
      entries.push(
        ...localizedEntries(`/ranking/${slug}?platform=tiktok`, { lastModified: lastMod })
      );
    }
    return entries;
  });

  const categories = getCategories();
  const categoryUrls = categories.flatMap(({ name, slug }) => {
    const entries = localizedEntries(`/ranking/topic/${slug}`, { lastModified: lastMod });
    if (getAccountsByCategoryAndPlatform(name, "tiktok").length >= SITEMAP_MIN_TIKTOK_ACCOUNTS) {
      entries.push(
        ...localizedEntries(`/ranking/topic/${slug}?platform=tiktok`, { lastModified: lastMod })
      );
    }
    return entries;
  });

  const categoryCountryUrls = categories.flatMap((cat) =>
    getCategoryCountries(cat.name).flatMap((country) => {
      const entries = localizedEntries(`/ranking/topic/${cat.slug}/${country.slug}`, {
        lastModified: lastMod,
      });
      if (
        getAccountsByCategoryCountryAndPlatform(cat.name, country.name, "tiktok").length >=
        SITEMAP_MIN_TIKTOK_ACCOUNTS
      ) {
        entries.push(
          ...localizedEntries(
            `/ranking/topic/${cat.slug}/${country.slug}?platform=tiktok`,
            { lastModified: lastMod }
          )
        );
      }
      return entries;
    })
  );

  const accountUrls = data.accounts.flatMap((account) =>
    localizedEntries(`/account/${account.platform}/${account.slug}`, {
      lastModified: lastMod,
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

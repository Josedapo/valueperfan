import { getAccountsData } from "./data";
import { MIN_ACCOUNTS_PER_COUNTRY } from "./config";
import { toSlug } from "./utils";

export interface CountryInfo {
  name: string;
  slug: string;
  count: number;
}

export function countryToSlug(country: string): string {
  return toSlug(country);
}

/**
 * Returns all countries with at least MIN_ACCOUNTS_PER_COUNTRY accounts,
 * sorted alphabetically by name.
 */
export function getCountries(): CountryInfo[] {
  const data = getAccountsData();
  const countryCount: Record<string, number> = {};

  for (const a of data.accounts) {
    if (a.country) {
      countryCount[a.country] = (countryCount[a.country] || 0) + 1;
    }
  }

  return Object.entries(countryCount)
    .filter(([, count]) => count >= MIN_ACCOUNTS_PER_COUNTRY)
    .map(([name, count]) => ({
      name,
      slug: countryToSlug(name),
      count,
    }))
    .sort((a, b) => {
      if (a.name === "Global") return 1;
      if (b.name === "Global") return -1;
      return a.name.localeCompare(b.name);
    });
}

/**
 * Find a country by its URL slug.
 */
export function slugToCountry(slug: string): CountryInfo | undefined {
  return getCountries().find((c) => c.slug === slug);
}

import { getAccountsData } from "./data";
import { MIN_ACCOUNTS_PER_COUNTRY } from "./config";
import { toSlug } from "./utils";

export const OTHER_COUNTRIES_SLUG = "other";
export const OTHER_COUNTRIES_NAME = "Other Countries";

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
 * plus an "Other Countries" entry for the rest. Sorted alphabetically,
 * with "Other Countries" and "Global" at the end.
 */
export function getCountries(): CountryInfo[] {
  const data = getAccountsData();
  const countryCount: Record<string, number> = {};

  for (const a of data.accounts) {
    if (a.country) {
      countryCount[a.country] = (countryCount[a.country] || 0) + 1;
    }
  }

  const major = Object.entries(countryCount)
    .filter(([, count]) => count >= MIN_ACCOUNTS_PER_COUNTRY)
    .map(([name, count]) => ({
      name,
      slug: countryToSlug(name),
      count,
    }));

  const majorNames = new Set(major.map((c) => c.name));
  const otherCount = Object.entries(countryCount)
    .filter(([name]) => !majorNames.has(name))
    .reduce((sum, [, count]) => sum + count, 0);

  if (otherCount > 0) {
    major.push({
      name: OTHER_COUNTRIES_NAME,
      slug: OTHER_COUNTRIES_SLUG,
      count: otherCount,
    });
  }

  return major.sort((a, b) => {
    if (a.name === "Global") return 1;
    if (b.name === "Global") return -1;
    if (a.name === OTHER_COUNTRIES_NAME) return 1;
    if (b.name === OTHER_COUNTRIES_NAME) return -1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Find a country by its URL slug.
 */
export function slugToCountry(slug: string): CountryInfo | undefined {
  return getCountries().find((c) => c.slug === slug);
}

/**
 * Returns the set of country names that have their own ranking page.
 */
export function getMajorCountryNames(): Set<string> {
  return new Set(
    getCountries()
      .filter((c) => c.slug !== OTHER_COUNTRIES_SLUG)
      .map((c) => c.name),
  );
}

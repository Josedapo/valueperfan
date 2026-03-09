import { getAccountsData } from "./data";
import { MIN_ACCOUNTS_PER_CATEGORY_COUNTRY } from "./config";
import { countryToSlug } from "./countries";
export { mapCategory } from "./category-map";
import { mapCategory } from "./category-map";

export interface CategoryInfo {
  name: string;
  slug: string;
  count: number;
}

export interface CountryInfo {
  name: string;
  slug: string;
  count: number;
}

export function categoryToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Returns all consolidated categories sorted alphabetically by name.
 */
export function getCategories(): CategoryInfo[] {
  const data = getAccountsData();
  const counts: Record<string, number> = {};

  for (const a of data.accounts) {
    const mapped = mapCategory(a.category);
    counts[mapped] = (counts[mapped] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      slug: categoryToSlug(name),
      count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Find a category by its URL slug.
 */
export function slugToCategory(slug: string): CategoryInfo | undefined {
  return getCategories().find((c) => c.slug === slug);
}

/**
 * Returns countries with at least MIN_ACCOUNTS_PER_CATEGORY_COUNTRY accounts
 * within the given consolidated category.
 */
export function getCategoryCountries(categoryName: string): CountryInfo[] {
  const data = getAccountsData();
  const countryCounts: Record<string, number> = {};

  for (const a of data.accounts) {
    if (mapCategory(a.category) === categoryName && a.country) {
      countryCounts[a.country] = (countryCounts[a.country] || 0) + 1;
    }
  }

  return Object.entries(countryCounts)
    .filter(([, count]) => count >= MIN_ACCOUNTS_PER_CATEGORY_COUNTRY)
    .map(([name, count]) => ({
      name,
      slug: countryToSlug(name),
      count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

import { getAccountsData } from "./data";

// Explicit mapping: display name → URL slug (plural, lowercase, URL-friendly)
const CATEGORY_SLUGS: Record<string, string> = {
  Athlete: "athletes",
  Musician: "musicians",
  Celebrity: "celebrities",
  "Content Creator": "content-creators",
  Actor: "actors",
  Model: "models",
  Comedian: "comedians",
  "TV Presenter": "tv-presenters",
};

// Reverse mapping: slug → display name
const SLUG_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([name, slug]) => [slug, name])
);

export function categoryToSlug(category: string): string {
  return (
    CATEGORY_SLUGS[category] ??
    category
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/y$/, "ie") + "s"
  );
}

export function slugToCategory(slug: string): string | undefined {
  return SLUG_TO_CATEGORY[slug];
}

export function categoryPluralLabel(category: string): string {
  const slug = categoryToSlug(category);
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getCategories(): string[] {
  const data = getAccountsData();
  const categories = new Set(data.accounts.map((a) => a.category));
  return Array.from(categories).sort();
}

export function getCategorySlugs(): { category: string; slug: string }[] {
  return getCategories().map((c) => ({ category: c, slug: categoryToSlug(c) }));
}

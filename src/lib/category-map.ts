// Pure mapping logic — no imports to avoid circular dependencies

const CATEGORY_MAP: Record<string, string> = {
  "Sport Team": "Sports Teams",
  "Athlete": "Athletes",
  "Sport Organization": "Sports Organizations",
  "Sport League": "Sports Organizations",
  "Musician": "Entertainment",
  "Actor": "Entertainment",
  "Celebrity": "Entertainment",
  "Entertainment": "Entertainment",
  "Media": "Media & Creators",
  "Content Creator": "Media & Creators",
};

/**
 * Maps a raw category from the data to its consolidated category.
 * Returns the original if no mapping exists.
 */
export function mapCategory(raw: string): string {
  return CATEGORY_MAP[raw] ?? raw;
}

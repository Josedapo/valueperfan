// Centralized configuration: env vars, constants, and app settings

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not set`);
  return value;
}

// Environment variables (accessed lazily via getters)
export const env = {
  get claimSecret() { return getEnv("CLAIM_SECRET"); },
  get resendApiKey() { return getEnv("RESEND_API_KEY"); },
  get notificationEmail() { return getEnv("NOTIFICATION_EMAIL"); },
  get postgresUrl() { return getEnv("POSTGRES_URL"); },
};

// App constants
export const BASE_URL = "https://valueperfan.com";
export const EMAIL_FROM = "ValuePerFan <noreply@valueperfan.com>";
export const CONTACT_EMAIL = "jose.poveda@horizm.com";

// Pagination & search
export const ITEMS_PER_PAGE = 50;
export const MIN_ACCOUNTS_PER_COUNTRY = 20;
export const MIN_ACCOUNTS_FOR_COUNTRY_RANKING = 10;
export const SEARCH_RESULTS_LIMIT = 8;
export const SEARCH_DEBOUNCE_MS = 200;
export const SEARCH_MIN_CHARS = 2;

// Cache TTLs (seconds)
export const CACHE_SEARCH_INDEX = "public, max-age=3600, s-maxage=86400";
export const CACHE_BADGE_SVG = "public, max-age=86400, s-maxage=86400";
export const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

// SSG
export const SSG_TOP_ACCOUNTS = 200;
// Note: ISR revalidate (86400s) must be a literal in page files per Next.js requirements

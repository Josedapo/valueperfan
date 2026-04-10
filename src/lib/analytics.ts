declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type AnalyticsEvent =
  | "page_not_found"
  | "calculator_search"
  | "search_query"
  | "search_result_click"
  | "suggest_submit"
  | "ranking_filter"
  | "ranking_metric_toggle"
  | "ranking_page_change"
  | "ranking_platform_change"
  | "claim_start"
  | "claim_email_submit"
  | "claim_bio_copied"
  | "claim_bio_confirmed"
  | "contact_submit";

type EventParams = Record<string, string | number | boolean>;

export function trackEvent(name: AnalyticsEvent, params?: EventParams): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, params);
  }
}

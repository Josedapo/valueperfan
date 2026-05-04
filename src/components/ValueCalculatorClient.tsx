"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "../i18n/navigation";
import Fuse from "fuse.js";
import type { SearchEntry } from "../lib/types";
import type { Platform } from "../lib/platform";
import { SEARCH_RESULTS_LIMIT, SEARCH_DEBOUNCE_MS, SEARCH_MIN_CHARS } from "../lib/config";
import { useClickOutside } from "../hooks/useClickOutside";
import AccountAvatar from "./AccountAvatar";
import PlatformIcon from "./PlatformIcon";
import { trackEvent } from "../lib/analytics";

interface AccountResult {
  handle: string;
  name: string;
  platform: Platform;
  slug: string;
  avatarUrl: string;
  followers: number;
  followersFormatted: string;
  posts: number;
  avgPerPostFormatted: string;
  totalValue: number;
  totalValueFormatted: string;
  valuePerFan: number;
  vpfFormatted: string;
  engRate: number;
  engRateFormatted: string;
  category: string;
  country: string | null;
  rank: { vpf: number; totalValue: number };
}

export default function ValueCalculatorClient({
  platformFilter,
  dataMonth,
}: {
  platformFilter?: "instagram" | "tiktok";
  dataMonth: string;
}) {
  const t = useTranslations("tools");
  const tSearch = useTranslations("search");

  // Autocomplete state
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [fuse, setFuse] = useState<Fuse<SearchEntry> | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const [indexLoading, setIndexLoading] = useState(false);
  const indexLoadedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Result state
  const [result, setResult] = useState<AccountResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Load search index on first focus
  const loadIndex = useCallback(() => {
    if (indexLoadedRef.current || indexLoading) return;
    setIndexLoading(true);
    indexLoadedRef.current = true;
    fetch("/api/search-index")
      .then((res) => res.json())
      .then((data: SearchEntry[]) => {
        const fuseInstance = new Fuse(data, {
          keys: ["name", "handle"],
          threshold: 0.3,
          includeScore: true,
          minMatchCharLength: 2,
        });
        setFuse(fuseInstance);
        setIndexLoading(false);
      });
  }, [indexLoading]);

  useClickOutside(containerRef, useCallback(() => setIsOpen(false), []));

  const handleSearch = useCallback(
    (value: string) => {
      if (!fuse || value.length < SEARCH_MIN_CHARS) {
        setSuggestions([]);
        setIsOpen(false);
        setShowSuggest(false);
        return;
      }

      const searchResults = fuse.search(value, { limit: SEARCH_RESULTS_LIMIT });
      let items = searchResults.map((r) => r.item);
      if (platformFilter) {
        items = items.filter((e) => e.platform === platformFilter);
      }
      setSuggestions(items);
      setIsOpen(true);
      setShowSuggest(items.length === 0 && value.length >= 3);
    },
    [fuse, platformFilter]
  );

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  async function handleSelect(entry: SearchEntry) {
    setIsOpen(false);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch(
        `/api/account-lookup?handle=${encodeURIComponent(entry.handle)}`
      );
      if (res.ok) {
        const data: AccountResult[] = await res.json();
        const match = platformFilter
          ? data.find((a) => a.platform === platformFilter)
          : data.find((a) => a.platform === entry.platform);
        const selected = match ?? data[0] ?? null;
        setResult(selected);
        if (selected) {
          trackEvent("calculator_search", {
            handle: selected.handle,
            platform: selected.platform,
            calculator_type: "value",
          });
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setQuery("");
    setResult(null);
    setSuggestions([]);
    setIsOpen(false);
    setShowSuggest(false);
  }

  return (
    <div className="mt-8">
      {/* Autocomplete input */}
        <div ref={containerRef} className="relative">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                loadIndex();
                if (suggestions.length > 0 || showSuggest) setIsOpen(true);
              }}
              placeholder={t("inputPlaceholder")}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 pl-10 text-base sm:text-sm placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {isOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg">
              {suggestions.length > 0 ? (
                <ul>
                  {suggestions.map((entry) => (
                    <li key={`${entry.platform}-${entry.handle}`}>
                      <button
                        type="button"
                        onClick={() => handleSelect(entry)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-surface-alt transition-colors text-left"
                      >
                        <AccountAvatar
                          src={entry.avatarUrl}
                          name={entry.name}
                          size={32}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium truncate">
                              {entry.name}
                            </p>
                            <span className="shrink-0 rounded-full bg-surface-alt border border-border px-2 py-0.5 text-[10px] text-text-muted">
                              {entry.category}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted">
                            @{entry.handle}
                          </p>
                        </div>
                        <PlatformIcon platform={entry.platform} size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : showSuggest ? (
                <SuggestForm
                  query={query}
                  platformFilter={platformFilter}
                  onClose={() => {
                    setIsOpen(false);
                    setShowSuggest(false);
                  }}
                />
              ) : null}
            </div>
          )}
        </div>

      {/* Loading */}
      {loading && (
        <div className="mt-6 text-center text-sm text-text-muted">
          {t("searching")}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-border bg-surface p-6">
            <p className="text-xs text-text-muted mb-3">
              {t("resultsOn", {
                platform:
                  result.platform === "instagram" ? "Instagram" : "TikTok",
              })}
            </p>

            <div className="flex items-center gap-3 mb-5">
              <AccountAvatar
                src={result.avatarUrl}
                name={result.name}
                size={48}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-text">
                    {result.name}
                  </h3>
                  <PlatformIcon platform={result.platform} size={18} />
                </div>
                <p className="text-sm text-text-secondary">
                  @{result.handle}
                </p>
              </div>
            </div>

            <p className="text-xs text-text-muted mb-2">
              {t("dataFromLabel", { month: dataMonth })}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg bg-primary-light px-4 py-3 text-center">
                <p className="text-xs text-text-secondary dark:text-emerald-200">
                  {t("avgValuePerPost")}
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-primary dark:text-emerald-300">
                  {result.avgPerPostFormatted}
                </p>
              </div>
              <div className="rounded-lg bg-primary-light px-4 py-3 text-center">
                <p className="text-xs text-text-secondary dark:text-emerald-200">
                  {t("totalValueLabel")}
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-primary dark:text-emerald-300">
                  {result.totalValueFormatted}
                </p>
              </div>
              <div className="rounded-lg bg-primary-light px-4 py-3 text-center">
                <p className="text-xs text-text-secondary dark:text-emerald-200">{t("vpfLabel")}</p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-primary dark:text-emerald-300">
                  {result.vpfFormatted}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="rounded-lg bg-surface-alt px-3 py-2 text-center">
                <p className="text-xs text-text-secondary">
                  {t("postsLabel")}
                </p>
                <p className="mt-0.5 text-sm font-bold text-text">
                  {(result.posts ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-surface-alt px-3 py-2 text-center">
                <p className="text-xs text-text-secondary">{t("rankLabel")}</p>
                <p className="mt-0.5 text-sm font-bold text-text">
                  #{result.rank.vpf}
                </p>
              </div>
              <div className="rounded-lg bg-surface-alt px-3 py-2 text-center">
                <p className="text-xs text-text-secondary">
                  {t("followersLabel")}
                </p>
                <p className="mt-0.5 text-sm font-bold text-text">
                  {result.followersFormatted}
                </p>
              </div>
              <div className="rounded-lg bg-surface-alt px-3 py-2 text-center">
                <p className="text-xs text-text-secondary">
                  {t("categoryLabel")}
                </p>
                <p className="mt-0.5 text-sm font-bold text-text">
                  {result.category}
                </p>
              </div>
            </div>

            <Link
              href={`/account/${result.platform}/${result.slug}`}
              className="inline-block text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              {t("viewFullProfile")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function SuggestForm({
  query,
  platformFilter,
  onClose,
}: {
  query: string;
  platformFilter?: "instagram" | "tiktok";
  onClose: () => void;
}) {
  const t = useTranslations("search");
  const [platform, setPlatform] = useState<Platform>(platformFilter || "instagram");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: query, platform, email }),
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      setSubmitted(true);
      trackEvent("suggest_submit", { handle: query, platform, source: "value_calculator" });
    } catch {
      setError(true);
    }
  }

  if (submitted) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm font-medium text-primary">{t("thankYou")}</p>
        <p className="mt-1 text-xs text-text-secondary">
          {t("notifyWhenAvailable")}
        </p>
        <button
          onClick={onClose}
          className="mt-2 text-xs text-text-muted hover:text-text"
        >
          {t("close")}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <p className="text-sm font-medium text-text">{t("cantFind")}</p>
      <p className="mt-1 text-xs text-text-secondary">{t("suggestPrompt")}</p>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            readOnly
            className="flex-1 rounded border border-border bg-surface-alt px-3 py-1.5 text-sm"
          />
          {!platformFilter && (
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="rounded border border-border bg-surface px-2 py-1.5 text-sm"
            >
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
            </select>
          )}
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailOptional")}
          className="rounded border border-border px-3 py-1.5 text-sm placeholder-text-muted"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-contrast hover:bg-primary-dark transition-colors"
        >
          {t("suggestButton")}
        </button>
        {error && (
          <p className="text-xs text-red-600">{t("suggestError")}</p>
        )}
      </form>
    </div>
  );
}

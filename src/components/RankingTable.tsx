"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link, useRouter } from "../i18n/navigation";
import type { Account } from "../lib/types";
import type { Platform, Metric } from "../lib/platform";
import { formatCurrency, formatVPF, formatFollowers, countryCodeToFlag } from "../lib/utils";
import { ITEMS_PER_PAGE } from "../lib/config";
import { mapCategory } from "../lib/categories";
import AccountAvatar from "./AccountAvatar";
import PlatformIcon from "./PlatformIcon";
import SearchBar from "./SearchBar";
import { trackEvent } from "../lib/analytics";

interface CountryOption {
  name: string;
  slug: string;
}

interface CategoryOption {
  name: string;
  slug: string;
}

export default function RankingTable({
  accounts,
  countries,
  currentCountrySlug = "all",
  categories,
  currentCategorySlug = "all",
  categoryName,
  countryName,
  showHeading = true,
  initialPage = 1,
  initialPlatform = "instagram",
  introText,
  dataMonth,
}: {
  accounts: Account[];
  countries: CountryOption[];
  currentCountrySlug?: string;
  categories?: CategoryOption[];
  currentCategorySlug?: string;
  categoryName?: string;
  countryName?: string;
  showHeading?: boolean;
  initialPage?: number;
  initialPlatform?: Platform;
  introText?: string;
  dataMonth: string;
}) {
  const t = useTranslations("ranking");
  const tCategories = useTranslations("categories");
  const tCountries = useTranslations("countries");
  const router = useRouter();
  const pathname = usePathname();
  const platform = initialPlatform;
  const [metric, setMetric] = useState<Metric>("totalValue");
  const [page, setPage] = useState(initialPage);

  // Countries and categories arrive pre-sorted from server components

  // Sync URL with page state
  useEffect(() => {
    const url = new URL(window.location.href);
    if (page > 1) {
      url.searchParams.set("page", String(page));
    } else {
      url.searchParams.delete("page");
    }
    if (url.href !== window.location.href) {
      window.history.replaceState(null, "", url.href);
    }
  }, [page]);

  const filtered = useMemo(() => {
    return [...accounts].sort((a, b) => {
      if (metric === "vpf") return a.rank.vpf - b.rank.vpf;
      return a.rank.totalValue - b.rank.totalValue;
    });
  }, [accounts, metric]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  function handleMetricChange(m: Metric) {
    trackEvent("ranking_metric_toggle", { metric: m });
    setMetric(m);
    setPage(1);
  }

  function handlePageChange(newPage: number, e?: React.MouseEvent) {
    if (e) e.preventDefault();
    trackEvent("ranking_page_change", { page: newPage });
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCountryChange(slug: string) {
    trackEvent("ranking_filter", { filter_type: "country", value: slug });
    const ps = platform === "tiktok" ? "?platform=tiktok" : "";
    if (slug === "all" && currentCategorySlug === "all") {
      router.push("/");
    } else if (slug === "all" && currentCategorySlug !== "all") {
      router.push(`/ranking/topic/${currentCategorySlug}${ps}`);
    } else if (currentCategorySlug !== "all") {
      router.push(`/ranking/topic/${currentCategorySlug}/${slug}${ps}`);
    } else {
      router.push(`/ranking/${slug}${ps}`);
    }
  }

  function handleCategoryChange(slug: string) {
    trackEvent("ranking_filter", { filter_type: "category", value: slug });
    const ps = platform === "tiktok" ? "?platform=tiktok" : "";
    if (slug === "all" && currentCountrySlug === "all") {
      router.push("/");
    } else if (slug === "all" && currentCountrySlug !== "all") {
      router.push(`/ranking/${currentCountrySlug}${ps}`);
    } else if (currentCountrySlug !== "all") {
      router.push(`/ranking/topic/${slug}/${currentCountrySlug}${ps}`);
    } else {
      router.push(`/ranking/topic/${slug}${ps}`);
    }
  }

  function pageHref(p: number): string {
    const params = new URLSearchParams();
    if (platform === "tiktok") params.set("platform", "tiktok");
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function platformHref(p: Platform): string {
    return p === "tiktok" ? `${pathname}?platform=tiktok` : pathname;
  }

  // Determine which dynamic title key to use
  function getDynamicTitleKey(): string {
    if (categoryName && countryName) {
      return metric === "vpf" ? "dynamicTitleCategoryCountryVpf" : "dynamicTitleCategoryCountryTotalValue";
    }
    if (categoryName) {
      return metric === "vpf" ? "dynamicTitleCategoryVpf" : "dynamicTitleCategoryTotalValue";
    }
    if (countryName) {
      return metric === "vpf" ? "dynamicTitleCountryVpf" : "dynamicTitleCountryTotalValue";
    }
    return metric === "vpf" ? "dynamicTitleVpf" : "dynamicTitleTotalValue";
  }

  return (
    <div>
      {/* Dynamic heading + search */}
      {showHeading && (
        <>
          <h1 className="text-3xl sm:text-4xl font-bold text-text text-center mb-4">
            {t.rich(getDynamicTitleKey(), {
              ...(categoryName ? { category: tCategories.has(categoryName) ? tCategories(categoryName) : categoryName } : {}),
              ...(countryName ? { country: tCountries.has(countryName) ? tCountries(countryName) : countryName } : {}),
              highlight: (chunks) => (
                <span className="text-primary">{chunks}</span>
              ),
            })}
          </h1>
          {introText && (
            <p className="mt-3 text-lg text-text-secondary max-w-2xl mx-auto text-center mb-6">
              {introText}
            </p>
          )}
          <div className="max-w-xl mx-auto w-full mb-6">
            <SearchBar />
          </div>
        </>
      )}

      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Platform selector (crawlable links) */}
          <div className="flex rounded-lg border border-border bg-surface overflow-hidden">
            <a
              href={platformHref("instagram")}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                platform === "instagram"
                  ? "bg-primary text-primary-contrast"
                  : "text-text-secondary hover:bg-surface-alt"
              }`}
            >
              <PlatformIcon
                platform="instagram"
                size={16}
                className={platform === "instagram" ? "brightness-0 invert" : ""}
              />
              Instagram
            </a>
            <a
              href={platformHref("tiktok")}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                platform === "tiktok"
                  ? "bg-primary text-primary-contrast"
                  : "text-text-secondary hover:bg-surface-alt"
              }`}
            >
              <PlatformIcon
                platform="tiktok"
                size={16}
                className={platform === "tiktok" ? "brightness-0 invert" : ""}
              />
              TikTok
            </a>
          </div>

          {/* Category filter */}
          {categories && categories.length > 0 && (
            <select
              value={currentCategorySlug}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">{t("allCategories")}</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {tCategories.has(c.name) ? tCategories(c.name) : c.name}
                </option>
              ))}
            </select>
          )}

          {/* Country filter (navigates to country route) */}
          {countries.length > 0 && (
            <select
              value={currentCountrySlug}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">{t("allCountries")}</option>
              {countries.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {tCountries.has(c.name) ? tCountries(c.name) : c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Metric toggle */}
        <div className="flex rounded-lg border border-border bg-surface overflow-hidden">
          <ToggleButton active={metric === "totalValue"} onClick={() => handleMetricChange("totalValue")}>
            {t("toggleTotalValue")}
          </ToggleButton>
          <ToggleButton active={metric === "vpf"} onClick={() => handleMetricChange("vpf")}>
            {t("toggleVpf")}
          </ToggleButton>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-alt text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
              <th className="px-4 py-3 w-14">#</th>
              <th className="px-4 py-3">{t("account")}</th>
              <th className="px-4 py-3 hidden sm:table-cell w-28">
                {t("category")}
              </th>
              <th className="px-4 py-3 text-right hidden sm:table-cell w-28">
                {t("followers")}
              </th>
              <th className="px-4 py-3 text-right font-bold text-primary w-28 sm:w-32">
                {metric === "vpf" ? (
                  t("columnVpf")
                ) : (
                  <>
                    {t("columnTotalValue")}
                    <span className="block text-[10px] font-normal italic text-text-muted normal-case tracking-normal">
                      {t("dataMonth", { month: dataMonth })}
                    </span>
                  </>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((account, index) => {
              const rank = (page - 1) * ITEMS_PER_PAGE + index + 1;
              const value =
                metric === "vpf"
                  ? formatVPF(account.valuePerFan)
                  : formatCurrency(account.totalValue);

              return (
                <tr
                  key={`${account.platform}-${account.handle}`}
                  className="border-b border-border last:border-0 hover:bg-surface-alt transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-text-muted">
                    {rank}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/account/${account.platform}/${account.slug}`}
                      className="flex items-center gap-3 hover:text-primary transition-colors"
                    >
                      <AccountAvatar
                        src={account.avatarUrl}
                        name={account.name}
                        size={36}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {account.name}
                          {account.countryCode && (
                            <span className="ml-1.5" title={account.country ?? undefined}>
                              {countryCodeToFlag(account.countryCode)}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-text-muted truncate">
                          @{account.handle}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary hidden sm:table-cell">
                    {tCategories.has(mapCategory(account.category)) ? tCategories(mapCategory(account.category)) : mapCategory(account.category)}
                  </td>
                  <td className="px-4 py-3 text-right text-text-secondary hidden sm:table-cell">
                    {formatFollowers(account.followers)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">
                    {value}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-between">
          <p className="text-sm text-text-muted">
            {t("accounts", { count: filtered.length })}
          </p>
          <div className="flex items-center gap-1">
            {page > 1 ? (
              <a
                href={pageHref(page - 1)}
                onClick={(e) => handlePageChange(page - 1, e)}
                className="rounded px-2 py-1.5 text-sm text-text-secondary hover:bg-surface-alt hover:text-primary transition-colors"
                aria-label="Previous page"
              >
                ‹
              </a>
            ) : (
              <span className="rounded px-2 py-1.5 text-sm text-text-muted" aria-hidden="true">‹</span>
            )}
            {getVisiblePages(page, totalPages).map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-1 text-sm text-text-muted">…</span>
              ) : p === page ? (
                <span
                  key={p}
                  className="rounded px-2 py-1.5 text-sm font-medium bg-primary text-primary-contrast"
                  aria-current="page"
                >
                  {p}
                </span>
              ) : (
                <a
                  key={p}
                  href={pageHref(p as number)}
                  onClick={(e) => handlePageChange(p as number, e)}
                  className="rounded px-2 py-1.5 text-sm text-text-secondary hover:bg-surface-alt hover:text-primary transition-colors"
                >
                  {p}
                </a>
              )
            )}
            {page < totalPages ? (
              <a
                href={pageHref(page + 1)}
                onClick={(e) => handlePageChange(page + 1, e)}
                className="rounded px-2 py-1.5 text-sm text-text-secondary hover:bg-surface-alt hover:text-primary transition-colors"
                aria-label="Next page"
              >
                ›
              </a>
            ) : (
              <span className="rounded px-2 py-1.5 text-sm text-text-muted" aria-hidden="true">›</span>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}

function getVisiblePages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, "...", total];
  if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-contrast"
          : "text-text-secondary hover:bg-surface-alt"
      }`}
    >
      {children}
    </button>
  );
}

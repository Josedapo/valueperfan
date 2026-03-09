"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "../i18n/navigation";
import type { Account } from "../lib/types";
import type { Platform, Metric } from "../lib/platform";
import { formatCurrency, formatVPF, formatFollowers, countryCodeToFlag } from "../lib/utils";
import { ITEMS_PER_PAGE } from "../lib/config";
import { mapCategory } from "../lib/categories";
import AccountAvatar from "./AccountAvatar";
import PlatformIcon from "./PlatformIcon";
import SearchBar from "./SearchBar";

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
}: {
  accounts: Account[];
  countries: CountryOption[];
  currentCountrySlug?: string;
  categories?: CategoryOption[];
  currentCategorySlug?: string;
  categoryName?: string;
  countryName?: string;
  showHeading?: boolean;
}) {
  const t = useTranslations("ranking");
  const tCategories = useTranslations("categories");
  const tCountries = useTranslations("countries");
  const router = useRouter();
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [metric, setMetric] = useState<Metric>("vpf");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const result = accounts.filter((a) => a.platform === platform);
    const sorted = [...result].sort((a, b) => {
      if (metric === "vpf") return a.rank.vpf - b.rank.vpf;
      return a.rank.totalValue - b.rank.totalValue;
    });
    return sorted;
  }, [accounts, platform, metric]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  function handlePlatformChange(p: Platform) {
    setPlatform(p);
    setPage(1);
  }

  function handleMetricChange(m: Metric) {
    setMetric(m);
    setPage(1);
  }

  function handleCountryChange(slug: string) {
    if (slug === "all" && currentCategorySlug === "all") {
      router.push("/");
    } else if (slug === "all" && currentCategorySlug !== "all") {
      router.push(`/ranking/category/${currentCategorySlug}`);
    } else if (currentCategorySlug !== "all") {
      router.push(`/ranking/category/${currentCategorySlug}/${slug}`);
    } else {
      router.push(`/ranking/${slug}`);
    }
  }

  function handleCategoryChange(slug: string) {
    if (slug === "all" && currentCountrySlug === "all") {
      router.push("/");
    } else if (slug === "all" && currentCountrySlug !== "all") {
      router.push(`/ranking/${currentCountrySlug}`);
    } else if (currentCountrySlug !== "all") {
      router.push(`/ranking/category/${slug}/${currentCountrySlug}`);
    } else {
      router.push(`/ranking/category/${slug}`);
    }
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
          <div className="max-w-xl mx-auto w-full mb-6">
            <SearchBar />
          </div>
        </>
      )}

      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Platform selector */}
          <div className="flex rounded-lg border border-border bg-surface overflow-hidden">
            <button
              onClick={() => handlePlatformChange("instagram")}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                platform === "instagram"
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-surface-alt"
              }`}
            >
              <PlatformIcon
                platform="instagram"
                size={16}
                className={platform === "instagram" ? "brightness-0 invert" : ""}
              />
              Instagram
            </button>
            <button
              onClick={() => handlePlatformChange("tiktok")}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                platform === "tiktok"
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-surface-alt"
              }`}
            >
              <PlatformIcon
                platform="tiktok"
                size={16}
                className={platform === "tiktok" ? "brightness-0 invert" : ""}
              />
              TikTok
            </button>
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
          <button
            onClick={() => handleMetricChange("vpf")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              metric === "vpf"
                ? "bg-primary text-white"
                : "text-text-secondary hover:bg-surface-alt"
            }`}
          >
            {t("toggleVpf")}
          </button>
          <button
            onClick={() => handleMetricChange("totalValue")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              metric === "totalValue"
                ? "bg-primary text-white"
                : "text-text-secondary hover:bg-surface-alt"
            }`}
          >
            {t("toggleTotalValue")}
          </button>
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
                      {t("last30days")}
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
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-text-muted">
            {t("accounts", { count: filtered.length })}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("previous")}
            </button>
            <span className="text-sm text-text-secondary">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

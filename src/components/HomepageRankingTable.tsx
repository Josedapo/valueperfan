"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "../i18n/navigation";
import type { Account } from "../lib/types";
import type { Platform, Metric } from "../lib/platform";
import { formatCurrency, formatVPF, formatFollowers, countryCodeToFlag } from "../lib/utils";
import { ITEMS_PER_PAGE } from "../lib/config";
import { mapCategory } from "../lib/categories";
import AccountAvatar from "./AccountAvatar";
import PlatformIcon from "./PlatformIcon";

interface CountryOption {
  name: string;
  slug: string;
}

interface CategoryOption {
  name: string;
  slug: string;
}

export default function HomepageRankingTable({
  initialAccounts,
  initialTotalCount,
  countries,
  categories,
}: {
  initialAccounts: Account[];
  initialTotalCount: number;
  countries: CountryOption[];
  categories: CategoryOption[];
}) {
  const t = useTranslations("ranking");
  const tCategories = useTranslations("categories");
  const tCountries = useTranslations("countries");
  const router = useRouter();

  const [platform, setPlatform] = useState<Platform>("instagram");
  const [metric, setMetric] = useState<Metric>("totalValue");
  const [page, setPage] = useState(1);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchPage = useCallback(async (p: Platform, m: Metric, pg: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ranking?platform=${p}&metric=${m}&page=${pg}`);
      const data = await res.json();
      setAccounts(data.accounts);
      setTotalCount(data.totalCount);
    } finally {
      setLoading(false);
    }
  }, []);

  function handlePlatformChange(p: Platform) {
    setPlatform(p);
    setPage(1);
    fetchPage(p, metric, 1);
  }

  function handleMetricChange(m: Metric) {
    setMetric(m);
    setPage(1);
    fetchPage(platform, m, 1);
  }

  function handlePageChange(pg: number) {
    setPage(pg);
    fetchPage(platform, metric, pg);
  }

  function handleCountryChange(slug: string) {
    if (slug === "all") {
      router.push("/");
    } else {
      router.push(`/ranking/${slug}`);
    }
  }

  function handleCategoryChange(slug: string) {
    if (slug === "all") {
      router.push("/");
    } else {
      router.push(`/ranking/topic/${slug}`);
    }
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Platform selector */}
          <div className="flex rounded-lg border border-border bg-surface overflow-hidden">
            <ToggleButton active={platform === "instagram"} onClick={() => handlePlatformChange("instagram")}>
              <PlatformIcon
                platform="instagram"
                size={16}
                className={platform === "instagram" ? "brightness-0 invert" : ""}
              />
              Instagram
            </ToggleButton>
            <ToggleButton active={platform === "tiktok"} onClick={() => handlePlatformChange("tiktok")}>
              <PlatformIcon
                platform="tiktok"
                size={16}
                className={platform === "tiktok" ? "brightness-0 invert" : ""}
              />
              TikTok
            </ToggleButton>
          </div>

          {/* Category filter */}
          {categories && categories.length > 0 && (
            <select
              value="all"
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

          {/* Country filter */}
          {countries.length > 0 && (
            <select
              value="all"
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
      <div className={`overflow-x-auto rounded-lg border border-border bg-surface${loading ? " opacity-60 transition-opacity" : ""}`}>
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
            {accounts.map((account, index) => {
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
            {t("accounts", { count: totalCount })}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1 || loading}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("previous")}
            </button>
            <span className="text-sm text-text-secondary">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || loading}
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

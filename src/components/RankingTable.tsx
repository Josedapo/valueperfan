"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "../i18n/navigation";
import type { Account } from "../lib/types";
import type { Platform, Metric } from "../lib/platform";
import { formatCurrency, formatVPF, formatFollowers } from "../lib/utils";
import { ITEMS_PER_PAGE } from "../lib/config";
import AccountAvatar from "./AccountAvatar";
import PlatformIcon from "./PlatformIcon";

interface CountryOption {
  name: string;
  slug: string;
}

export default function RankingTable({
  accounts,
  countries,
  currentCountrySlug = "all",
}: {
  accounts: Account[];
  countries: CountryOption[];
  currentCountrySlug?: string;
}) {
  const t = useTranslations("ranking");
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
    if (slug === "all") {
      router.push("/");
    } else {
      router.push(`/ranking/${slug}`);
    }
  }

  return (
    <div>
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
                  {c.name}
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
            {t("valuePerFan")}
          </button>
          <button
            onClick={() => handleMetricChange("totalValue")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              metric === "totalValue"
                ? "bg-primary text-white"
                : "text-text-secondary hover:bg-surface-alt"
            }`}
          >
            {t("totalValue")}
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
                  t("valuePerFanShort")
                ) : (
                  <>
                    {t("totalValue")}
                    <span className="block text-[10px] font-normal italic text-text-muted normal-case tracking-normal">
                      {t("last30days")}
                    </span>
                  </>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((account) => {
              const rank =
                metric === "vpf" ? account.rank.vpf : account.rank.totalValue;
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
                        <p className="font-medium truncate">{account.name}</p>
                        <p className="text-xs text-text-muted truncate">
                          @{account.handle}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary hidden sm:table-cell">
                    {account.category}
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

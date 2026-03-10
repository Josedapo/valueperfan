import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  getAccountsData,
  getAccount,
  getAccountsByPlatform,
  getNeighbors,
  getAccountsByCountryAndPlatform,
  getAccountsByCategoryAndPlatform,
  getAccountsByCategoryCountryAndPlatform,
  getEngagementRateBenchmark,
} from "../../../../../lib/data";
import {
  formatCurrency,
  formatVPF,
  formatFollowers,
  countryCodeToFlag,
} from "../../../../../lib/utils";
import { platformLabel, type Platform } from "../../../../../lib/platform";
import {
  SSG_TOP_ACCOUNTS,
  MIN_ACCOUNTS_FOR_COUNTRY_RANKING,
} from "../../../../../lib/config";
import { mapCategory, categoryToSlug } from "../../../../../lib/categories";
import { countryToSlug } from "../../../../../lib/countries";
import { locales } from "../../../../../i18n/config";
import { Link } from "../../../../../i18n/navigation";
import AccountAvatar from "../../../../../components/AccountAvatar";
import MiniRanking from "../../../../../components/MiniRanking";
import ClaimFlow from "../../../../../components/ClaimFlow";
import PlatformIcon from "../../../../../components/PlatformIcon";
import SearchBar from "../../../../../components/SearchBar";

// Pre-render top accounts (by VPF rank) per locale for fast initial load + SEO.
// Remaining accounts are generated on-demand via ISR.
export async function generateStaticParams() {
  const data = getAccountsData();
  const top = data.accounts.filter((a) => a.rank.vpf <= SSG_TOP_ACCOUNTS);
  return locales.flatMap((locale) =>
    top.map((account) => ({
      locale,
      platform: account.platform,
      handle: account.slug,
    }))
  );
}

export const dynamicParams = true;
export const revalidate = 86400; // 24 hours

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; platform: string; handle: string }>;
}) {
  const { locale, platform, handle } = await params;
  const account = getAccount(platform, handle);
  const t = await getTranslations({ locale, namespace: "account" });

  if (!account) return { title: t("notFound") };

  const pLabel = platformLabel(account.platform);
  const title = t("metaTitle", {
    name: account.name,
    handle: account.handle,
    platform: pLabel,
    vpf: formatVPF(account.valuePerFan),
  });
  const description = t("metaDescription", {
    name: account.name,
    platform: pLabel,
    vpf: formatVPF(account.valuePerFan),
    totalValue: formatCurrency(account.totalValue),
    rank: account.rank.vpf,
    total: getAccountsData().meta.platforms[account.platform],
  });
  const basePath = `/account/${account.platform}/${account.slug}`;
  const url = `https://valueperfan.com${locale === "en" ? "" : `/${locale}`}${basePath}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "ValuePerFan",
      type: "profile",
    },
    twitter: { card: "summary", title, description },
    alternates: {
      canonical: url,
      languages: {
        en: `https://valueperfan.com${basePath}`,
        es: `https://valueperfan.com/es${basePath}`,
        "pt-BR": `https://valueperfan.com/br${basePath}`,
      },
    },
  };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string; platform: string; handle: string }>;
}) {
  const { locale, platform, handle } = await params;
  setRequestLocale(locale);
  const account = getAccount(platform, handle);

  if (!account) {
    notFound();
  }

  const t = await getTranslations("account");
  const vpfNeighbors = getNeighbors(account, 3, "vpf");
  const tvNeighbors = getNeighbors(account, 3, "totalValue");
  const pLabel = platformLabel(account.platform);
  const globalTotal = getAccountsByPlatform(account.platform).length;

  // Country rankings (if account has a country with enough accounts)
  const countryAccounts = account.country
    ? getAccountsByCountryAndPlatform(account.country, account.platform)
    : [];
  const showCountryRankings =
    countryAccounts.length >= MIN_ACCOUNTS_FOR_COUNTRY_RANKING;
  const countryVpf = showCountryRankings
    ? getNeighbors(account, 3, "vpf", countryAccounts)
    : null;
  const countryTv = showCountryRankings
    ? getNeighbors(account, 3, "totalValue", countryAccounts)
    : null;

  // Slugs for ranking links
  const mappedCategory = mapCategory(account.category);
  const categorySlug = categoryToSlug(mappedCategory);
  const countrySlug = account.country ? countryToSlug(account.country) : null;

  // Category rankings
  const categoryAccounts = getAccountsByCategoryAndPlatform(
    mappedCategory,
    account.platform
  );
  const showCategoryRankings =
    categoryAccounts.length >= MIN_ACCOUNTS_FOR_COUNTRY_RANKING;
  const categoryVpf = showCategoryRankings
    ? getNeighbors(account, 3, "vpf", categoryAccounts)
    : null;
  const categoryTv = showCategoryRankings
    ? getNeighbors(account, 3, "totalValue", categoryAccounts)
    : null;

  // Category + Country rankings
  const categoryCountryAccounts =
    account.country
      ? getAccountsByCategoryCountryAndPlatform(
          mappedCategory,
          account.country,
          account.platform
        )
      : [];
  const showCategoryCountryRankings =
    categoryCountryAccounts.length >= MIN_ACCOUNTS_FOR_COUNTRY_RANKING;
  const categoryCountryVpf = showCategoryCountryRankings
    ? getNeighbors(account, 3, "vpf", categoryCountryAccounts)
    : null;
  const categoryCountryTv = showCategoryCountryRankings
    ? getNeighbors(account, 3, "totalValue", categoryCountryAccounts)
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: t("jsonLdName", { name: account.name, platform: pLabel }),
    description: t("jsonLdDescription", {
      name: account.name,
      platform: pLabel,
    }),
    mainEntity: {
      "@type": "Person",
      name: account.name,
      url: account.profileUrl || undefined,
      sameAs: account.profileUrl ? [account.profileUrl] : undefined,
    },
  };

  return (
    <div className="max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/" className="hover:text-primary transition-colors">
          {t("rankings")}
        </Link>
        <span className="mx-2">/</span>
        <span className="capitalize">{pLabel}</span>
        <span className="mx-2">/</span>
        <span className="text-text">{account.name}</span>
      </nav>

      {/* Search */}
      <section className="max-w-xl mx-auto w-full mb-6">
        <SearchBar />
      </section>

      {/* Account Header */}
      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="flex items-start gap-4">
          <AccountAvatar
            src={account.avatarUrl}
            name={account.name}
            size={80}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text truncate">
                {account.name}
                {account.countryCode && (
                  <span className="ml-2" title={account.country ?? undefined}>
                    {countryCodeToFlag(account.countryCode)}
                  </span>
                )}
              </h1>
              <PlatformIcon platform={account.platform} size={22} />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-text-secondary">@{account.handle}</p>
              <Link
                href={`/ranking/topic/${categorySlug}`}
                className="inline-flex items-center rounded-full bg-surface-alt border border-border px-2.5 py-0.5 text-xs font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors"
              >
                {mappedCategory}
              </Link>
            </div>
            {account.profileUrl && (
              <a
                href={account.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm text-primary hover:text-primary-dark transition-colors"
              >
                {t("viewOn", { platform: pLabel })}
              </a>
            )}
          </div>
        </div>

        {/* Claim CTA — inline */}
        <div className="mt-4">
          <ClaimFlow
            platform={account.platform}
            handle={account.handle}
            slug={account.slug}
            name={account.name}
          />
        </div>

        {/* Value — highlighted */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-primary-light px-4 py-4 text-center">
            <p className="text-xs text-text-secondary">
              {t("totalValueLabel")}
            </p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {formatCurrency(account.totalValue)}
            </p>
          </div>
          <div className="rounded-lg bg-primary-light px-4 py-4 text-center">
            <p className="text-xs text-text-secondary">
              {t("valuePerFan")}
            </p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {formatVPF(account.valuePerFan)}
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-5">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
            {t("performanceSectionTitle")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard
              label={t("followersLabel")}
              value={formatFollowers(account.followers)}
            />
            <MetricCard
              label={t("postsLabel")}
              value={account.posts.toLocaleString()}
            />
            <MetricCard
              label={t("impressionsLabel")}
              value={formatFollowers(account.impressions)}
            />
            <MetricCard
              label={t("engagementLabel")}
              value={formatFollowers(account.engagement)}
            />
          </div>

          {/* Engagement Rate with Benchmark */}
          <EngagementRateBenchmarkCard
            engRate={account.engRate}
            category={mappedCategory}
            platform={account.platform}
            platformLabel={pLabel}
            t={t}
          />
        </div>

      </div>

      {/* Rankings Section */}
      <div className="mt-6">
        {/* Global Rankings */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-text uppercase tracking-wider">
            {t("globalRankingsTitle", { count: globalTotal.toLocaleString() })}
          </h2>
          <Link href="/" className="text-xs text-primary hover:text-primary-dark transition-colors">
            {t("viewRanking")}
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <MiniRanking
            above={tvNeighbors.above}
            current={account}
            below={tvNeighbors.below}
            metric="totalValue"
          />
          <MiniRanking
            above={vpfNeighbors.above}
            current={account}
            below={vpfNeighbors.below}
            metric="vpf"
          />
        </div>

        {/* Country Rankings */}
        {showCountryRankings && countryVpf && countryTv && countrySlug && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                {account.countryCode && countryCodeToFlag(account.countryCode)}{" "}
                {t("countryRankingsTitle", { country: account.country ?? "", count: countryAccounts.length.toLocaleString() })}
              </h3>
              <Link href={`/ranking/${countrySlug}`} className="text-xs text-primary hover:text-primary-dark transition-colors">
                {t("viewRanking")}
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <MiniRanking
                above={countryTv.above}
                current={account}
                below={countryTv.below}
                metric="totalValue"
                startRank={countryTv.currentRank - countryTv.above.length}
              />
              <MiniRanking
                above={countryVpf.above}
                current={account}
                below={countryVpf.below}
                metric="vpf"
                startRank={countryVpf.currentRank - countryVpf.above.length}
              />
            </div>
          </div>
        )}

        {/* Category Rankings */}
        {showCategoryRankings && categoryVpf && categoryTv && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                {t("categoryRankingsTitle", { category: mappedCategory, count: categoryAccounts.length.toLocaleString() })}
              </h3>
              <Link href={`/ranking/topic/${categorySlug}`} className="text-xs text-primary hover:text-primary-dark transition-colors">
                {t("viewRanking")}
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <MiniRanking
                above={categoryTv.above}
                current={account}
                below={categoryTv.below}
                metric="totalValue"
                startRank={categoryTv.currentRank - categoryTv.above.length}
              />
              <MiniRanking
                above={categoryVpf.above}
                current={account}
                below={categoryVpf.below}
                metric="vpf"
                startRank={categoryVpf.currentRank - categoryVpf.above.length}
              />
            </div>
          </div>
        )}

        {/* Category + Country Rankings */}
        {showCategoryCountryRankings && categoryCountryVpf && categoryCountryTv && countrySlug && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                {account.countryCode && countryCodeToFlag(account.countryCode)}{" "}
                {t("categoryCountryRankingsTitle", { category: mappedCategory, country: account.country ?? "", count: categoryCountryAccounts.length.toLocaleString() })}
              </h3>
              <Link href={`/ranking/topic/${categorySlug}/${countrySlug}`} className="text-xs text-primary hover:text-primary-dark transition-colors">
                {t("viewRanking")}
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <MiniRanking
                above={categoryCountryTv.above}
                current={account}
                below={categoryCountryTv.below}
                metric="totalValue"
                startRank={categoryCountryTv.currentRank - categoryCountryTv.above.length}
              />
              <MiniRanking
                above={categoryCountryVpf.above}
                current={account}
                below={categoryCountryVpf.below}
                metric="vpf"
                startRank={categoryCountryVpf.currentRank - categoryCountryVpf.above.length}
              />
            </div>
          </div>
        )}
      </div>

      {/* PME Context */}
      <div className="mt-6 text-xs text-text-secondary leading-relaxed space-y-1.5">
        <p>{t("pmeContext1")}</p>
        <p>{t("pmeContext2")}</p>
        {account.platform === "instagram" && (
          <p>{t("instagramStoriesNote")}</p>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-surface-alt px-4 py-3 text-center">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="mt-1 text-lg font-bold text-text">{value}</p>
    </div>
  );
}

function EngagementRateBenchmarkCard({
  engRate,
  category,
  platform,
  platformLabel: pLabel,
  t,
}: {
  engRate: number;
  category: string;
  platform: Platform;
  platformLabel: string;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const benchmark = getEngagementRateBenchmark(category, platform, engRate);
  const accountPct = (engRate * 100).toFixed(2);

  if (!benchmark) {
    // Not enough data — show simple card like before
    return (
      <div className="mt-3 rounded-lg bg-surface-alt px-4 py-3 text-center">
        <p className="text-xs text-text-secondary">{t("engRateLabel")}</p>
        <p className="mt-1 text-lg font-bold text-text">{accountPct}%</p>
      </div>
    );
  }

  const medianPct = (benchmark.median * 100).toFixed(2);
  const position = Math.min(Math.max(benchmark.percentile, 2), 98);
  const isTopHalf = benchmark.percentile >= 50;
  const displayPercentile = Math.max(
    1,
    isTopHalf ? 100 - benchmark.percentile : benchmark.percentile
  );

  // 3 color tiers: top 25% green, bottom 25% red, middle amber
  const tier =
    benchmark.percentile >= 50 ? "green" : benchmark.percentile >= 25 ? "amber" : "red";
  const barColor = { green: "bg-emerald-400", amber: "bg-amber-400", red: "bg-red-400" }[tier];
  const dotColor = { green: "bg-emerald-500", amber: "bg-amber-500", red: "bg-red-500" }[tier];
  const labelColor = { green: "text-emerald-400", amber: "text-amber-400", red: "text-red-400" }[tier];

  return (
    <div className="mt-3 rounded-lg bg-surface-alt px-4 py-4">
      {/* Numbers row */}
      <div className="flex items-center justify-between mb-4">
        {/* Account's ER */}
        <div className="text-center flex-1">
          <p className="text-xs text-text-secondary">{t("engRateLabel")}</p>
          <p className="mt-1 text-2xl font-bold text-text">{accountPct}%</p>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-border mx-4" />

        {/* Category median */}
        <div className="text-center flex-1">
          <p className="text-xs text-text-secondary">
            {t("engRateBenchmarkMedian", { category, platform: pLabel })}
          </p>
          <p className="mt-1 text-2xl font-bold text-text-secondary">
            {medianPct}%
          </p>
        </div>

      </div>

      {/* Progress bar with floating label */}
      <div className="relative h-2 rounded-full bg-border overflow-visible mt-9">
        {/* Filled portion up to account position */}
        <div
          className={`absolute top-0 left-0 h-full rounded-full ${barColor}`}
          style={{ width: `${position}%` }}
        />

        {/* Median marker (always at 50%) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-text-secondary"
          style={{ left: "50%" }}
          title={`Median: ${medianPct}%`}
        />

        {/* Account marker + floating label */}
        <div
          className="absolute"
          style={{ left: `${position}%`, top: "50%", transform: "translate(-50%, -50%)" }}
        >
          {/* Floating label above */}
          <span
            className={`absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold ${labelColor}`}
          >
            {isTopHalf
              ? t("engRateBenchmarkPercentile", { percentile: displayPercentile })
              : t("engRateBenchmarkBottom", { percentile: displayPercentile })}
          </span>
          {/* Dot */}
          <div
            className={`w-3 h-3 rounded-full border-2 border-white ${dotColor}`}
          />
        </div>
      </div>

      {/* Labels under bar */}
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-text-muted">{t("engRateBenchmarkLow")}</span>
        <span className="text-[10px] text-text-muted">{t("engRateBenchmarkMedianLabel")}</span>
        <span className="text-[10px] text-text-muted">{t("engRateBenchmarkHigh")}</span>
      </div>
    </div>
  );
}

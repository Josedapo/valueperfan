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
} from "../../../../../lib/data";
import {
  formatCurrency,
  formatVPF,
  formatFollowers,
  formatDataMonth,
  countryCodeToFlag,
} from "../../../../../lib/utils";
import { platformLabel } from "../../../../../lib/platform";
import {
  SSG_TOP_ACCOUNTS,
  MIN_ACCOUNTS_FOR_COUNTRY_RANKING,
} from "../../../../../lib/config";
import { mapCategory, categoryToSlug } from "../../../../../lib/categories";
import { countryToSlug } from "../../../../../lib/countries";
import { locales } from "../../../../../i18n/config";
import { Link } from "../../../../../i18n/navigation";
import AccountAvatar from "../../../../../components/AccountAvatar";
import MetricCard from "../../../../../components/MetricCard";
import EngagementRateBenchmark from "../../../../../components/EngagementRateBenchmark";
import AccountRankingSection from "../../../../../components/AccountRankingSection";
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
        "x-default": `https://valueperfan.com${basePath}`,
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
  const tCategories = await getTranslations("categories");
  const tCountries = await getTranslations("countries");
  const data = getAccountsData();
  const formattedDataMonth = formatDataMonth(data.meta.dataMonth, locale);
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

  const baseUrl = `https://valueperfan.com${locale === "en" ? "" : `/${locale}`}`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t("rankings"),
        item: `${baseUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${pLabel} — ${account.name}`,
      },
    ],
  };

  return (
    <div className="max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
          <EngagementRateBenchmark
            engRate={account.engRate}
            category={mappedCategory}
            platform={account.platform}
            platformLabel={pLabel}
            t={t}
          />
          <p className="text-xs text-text-muted text-right mt-3">
            {t("dataFrom", { month: formattedDataMonth })}
          </p>
        </div>

      </div>

      {/* About this account */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
        <h2 className="text-sm font-bold text-text uppercase tracking-wider mb-3">
          {t("aboutTitle")}
        </h2>
        <div className="text-sm text-text-secondary leading-relaxed space-y-2">
          <p>
            {t("aboutWho", {
              name: account.name,
              category: tCategories.has(mappedCategory) ? tCategories(mappedCategory) : mappedCategory,
              platform: pLabel,
              followers: formatFollowers(account.followers),
              country: account.country ? (tCountries.has(account.country) ? tCountries(account.country) : account.country) : "Global",
            })}
          </p>
          <p>
            {t("aboutValue", {
              name: account.name,
              totalValue: formatCurrency(account.totalValue),
              vpf: formatVPF(account.valuePerFan),
              rankVpf: account.rank.vpf,
              platformTotal: globalTotal.toLocaleString(),
              platform: pLabel,
            })}
          </p>
          <p>{t("aboutContext")}</p>
        </div>
      </div>

      {/* Rankings Section */}
      <div className="mt-6">
        {/* Global Rankings */}
        <AccountRankingSection
          title={t("globalRankingsTitle", { count: globalTotal.toLocaleString() })}
          linkHref="/"
          linkLabel={t("viewRanking")}
          tvNeighbors={tvNeighbors}
          vpfNeighbors={vpfNeighbors}
          account={account}
          titleTag="h2"
          titleClassName="text-sm font-bold text-text uppercase tracking-wider"
        />

        {/* Country Rankings */}
        {showCountryRankings && countryVpf && countryTv && countrySlug && (
          <AccountRankingSection
            title={t("countryRankingsTitle", { country: account.country ?? "", count: countryAccounts.length.toLocaleString() })}
            linkHref={`/ranking/${countrySlug}`}
            linkLabel={t("viewRanking")}
            tvNeighbors={countryTv}
            vpfNeighbors={countryVpf}
            account={account}
            flag={account.countryCode ? countryCodeToFlag(account.countryCode) : null}
          />
        )}

        {/* Category Rankings */}
        {showCategoryRankings && categoryVpf && categoryTv && (
          <AccountRankingSection
            title={t("categoryRankingsTitle", { category: mappedCategory, count: categoryAccounts.length.toLocaleString() })}
            linkHref={`/ranking/topic/${categorySlug}`}
            linkLabel={t("viewRanking")}
            tvNeighbors={categoryTv}
            vpfNeighbors={categoryVpf}
            account={account}
          />
        )}

        {/* Category + Country Rankings */}
        {showCategoryCountryRankings && categoryCountryVpf && categoryCountryTv && countrySlug && (
          <AccountRankingSection
            title={t("categoryCountryRankingsTitle", { category: mappedCategory, country: account.country ?? "", count: categoryCountryAccounts.length.toLocaleString() })}
            linkHref={`/ranking/topic/${categorySlug}/${countrySlug}`}
            linkLabel={t("viewRanking")}
            tvNeighbors={categoryCountryTv}
            vpfNeighbors={categoryCountryVpf}
            account={account}
            flag={account.countryCode ? countryCodeToFlag(account.countryCode) : null}
          />
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

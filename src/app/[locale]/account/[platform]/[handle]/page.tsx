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
  formatCurrencyFull,
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
import Breadcrumbs from "../../../../../components/Breadcrumbs";
import AccountAvatar from "../../../../../components/AccountAvatar";
import MetricCard from "../../../../../components/MetricCard";
import EngagementRateBenchmark from "../../../../../components/EngagementRateBenchmark";
import RankingTabs from "../../../../../components/RankingTabs";
import ClaimFlow from "../../../../../components/ClaimFlow";
import PlatformIcon from "../../../../../components/PlatformIcon";
import SearchBar from "../../../../../components/SearchBar";
import FaqSection from "../../../../../components/FaqSection";

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
    totalValue: formatCurrency(account.totalValue),
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
    twitter: { card: "summary_large_image", title, description },
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
  const formattedPublished = formatDataMonth("2026-03", locale);
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

  const breadcrumbItems = [
    { label: t("rankings"), href: "/" },
    { label: pLabel, href: `/?platform=${account.platform}` },
    { label: account.name },
  ];

  const faqValues = {
    name: account.name,
    platform: pLabel,
    totalValue: formatCurrency(account.totalValue),
    vpf: formatVPF(account.valuePerFan),
    rankVpf: account.rank.vpf,
    rankTv: account.rank.totalValue,
    platformTotal: globalTotal.toLocaleString(),
    category: mappedCategory,
    categoryCount: categoryAccounts.length.toLocaleString(),
  };

  const faqItems = [
    { question: t("faq1Q", faqValues), answer: t("faq1A", faqValues) },
    { question: t("faq2Q", faqValues), answer: t("faq2A", faqValues) },
    { question: t("faq3Q", faqValues), answer: t("faq3A", faqValues) },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={breadcrumbItems} locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />


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
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-2xl font-bold text-text truncate">
                {account.name}
                {account.countryCode && (
                  <span className="ml-2" title={account.country ?? undefined}>
                    {countryCodeToFlag(account.countryCode)}
                  </span>
                )}
              </h1>
              <PlatformIcon platform={account.platform} size={22} />
              <div className="hidden sm:block shrink-0 ml-auto">
                <ClaimFlow
                  platform={account.platform}
                  handle={account.handle}
                  slug={account.slug}
                  name={account.name}
                  compact
                />
              </div>
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
            <div className="flex items-center gap-3 mt-1">
              {account.profileUrl && (
                <a
                  href={account.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-primary-dark transition-colors"
                >
                  {t("viewOn", { platform: pLabel })}
                </a>
              )}
              <div className="sm:hidden">
                <ClaimFlow
                  platform={account.platform}
                  handle={account.handle}
                  slug={account.slug}
                  name={account.name}
                  compact
                />
              </div>
            </div>
          </div>
        </div>

        {/* About this account */}
        <div className="mt-4 text-sm text-text-secondary leading-relaxed space-y-2">
          <p>
            {t.rich("aboutWho", {
              bold: (chunks) => <strong className="font-semibold text-text">{chunks}</strong>,
              name: account.name,
              category: tCategories.has(mappedCategory) ? tCategories(mappedCategory) : mappedCategory,
              platform: pLabel,
              followers: formatFollowers(account.followers),
              country: account.country ? (tCountries.has(account.country) ? tCountries(account.country) : account.country) : "Global",
            })}
          </p>
          <p>
            {t.rich("aboutValue", {
              bold: (chunks) => <strong className="font-semibold text-text">{chunks}</strong>,
              name: account.name,
              totalValue: formatCurrency(account.totalValue),
              vpf: formatVPF(account.valuePerFan),
              avgPerPost: account.posts > 0 ? formatCurrency(account.totalValue / account.posts) : "$0",
              rankVpf: account.rank.vpf,
              platformTotal: globalTotal.toLocaleString(),
              platform: pLabel,
            })}
          </p>
        </div>

        {/* Data period + metrics */}
        <p className="mt-6 mb-2 text-xs font-medium text-text-secondary uppercase tracking-wider">
          {t("dataFromLabel", { month: formattedDataMonth })}
        </p>

        {/* Average Value per Post — key metric for creators */}
        {account.posts > 0 && (
          <div className="rounded-lg border-2 border-primary bg-primary-light px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <p className="text-xs font-medium text-text-secondary">
                  {t("avgValuePerPost")}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {t("avgValuePerPostHint")}
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-primary">
                {formatCurrencyFull(account.totalValue / account.posts)}
              </p>
            </div>
          </div>
        )}

        {/* Value — highlighted */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg bg-primary-light px-4 py-3 text-center">
            <p className="text-xs text-text-secondary">
              {t("totalValueLabel")}
            </p>
            <p className="mt-1 text-lg sm:text-2xl font-bold text-primary">
              {formatCurrencyFull(account.totalValue)}
            </p>
          </div>
          <div className="rounded-lg bg-primary-light px-4 py-3 text-center">
            <p className="text-xs text-text-secondary">
              {t("valuePerFan")}
            </p>
            <p className="mt-1 text-lg sm:text-2xl font-bold text-primary">
              {formatCurrencyFull(account.valuePerFan * 1000)}
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
              label={t("postsLabel")}
              value={account.posts.toLocaleString()}
            />
            <MetricCard
              label={t("followersLabel")}
              value={formatFollowers(account.followers)}
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
            {t("dataFrom", { month: formattedDataMonth, published: formattedPublished })}
          </p>
        </div>

      </div>

      {/* Rankings Section */}
      <div className="mt-6">
        <h2 className="text-sm font-bold text-text uppercase tracking-wider mb-4">
          {t("rankingsSectionTitle")}
        </h2>
        <RankingTabs
          tabs={[
            {
              id: "global",
              label: t("globalTabLabel"),
              title: t("globalRankingsTitle", { count: globalTotal.toLocaleString() }),
              linkHref: "/",
              linkLabel: t("viewRanking"),
              tvNeighbors: tvNeighbors,
              vpfNeighbors: vpfNeighbors,
              account: account,
            },
            ...(showCountryRankings && countryVpf && countryTv && countrySlug
              ? [{
                  id: "country",
                  label: t("countryTabLabel", { country: account.country ?? "" }),
                  title: t("countryRankingsTitle", { country: account.country ?? "", count: countryAccounts.length.toLocaleString() }),
                  linkHref: `/ranking/${countrySlug}`,
                  linkLabel: t("viewRanking"),
                  tvNeighbors: countryTv,
                  vpfNeighbors: countryVpf,
                  account: account,
                }]
              : []),
            ...(showCategoryRankings && categoryVpf && categoryTv
              ? [{
                  id: "category",
                  label: t("categoryTabLabel", { category: mappedCategory }),
                  title: t("categoryRankingsTitle", { category: mappedCategory, count: categoryAccounts.length.toLocaleString() }),
                  linkHref: `/ranking/topic/${categorySlug}`,
                  linkLabel: t("viewRanking"),
                  tvNeighbors: categoryTv,
                  vpfNeighbors: categoryVpf,
                  account: account,
                }]
              : []),
            ...(showCategoryCountryRankings && categoryCountryVpf && categoryCountryTv && countrySlug
              ? [{
                  id: "category-country",
                  label: t("categoryCountryTabLabel", { category: mappedCategory, country: account.country ?? "" }),
                  title: t("categoryCountryRankingsTitle", { category: mappedCategory, country: account.country ?? "", count: categoryCountryAccounts.length.toLocaleString() }),
                  linkHref: `/ranking/topic/${categorySlug}/${countrySlug}`,
                  linkLabel: t("viewRanking"),
                  tvNeighbors: categoryCountryTv,
                  vpfNeighbors: categoryCountryVpf,
                  account: account,
                }]
              : []),
          ]}
        />
      </div>

      {/* FAQ */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">
          {t("faqTitle")}
        </h2>
        <FaqSection items={faqItems} />
      </div>

      {/* PME Context */}
      <div className="mt-6 text-xs text-text-secondary leading-relaxed space-y-1.5">
        <p>{t("aboutContext")}</p>
        <p>{t("pmeContext1")}</p>
        <p>{t("pmeContext2")}</p>
        {account.platform === "instagram" && (
          <p>{t("instagramStoriesNote")}</p>
        )}
      </div>
    </div>
  );
}

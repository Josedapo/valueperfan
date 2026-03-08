import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  getAccountsData,
  getAccount,
  getAccountsByPlatform,
  getNeighbors,
  getAccountsByCountryAndPlatform,
} from "../../../../../lib/data";
import {
  formatCurrency,
  formatVPF,
  formatFollowers,
  countryCodeToFlag,
} from "../../../../../lib/utils";
import { platformLabel } from "../../../../../lib/platform";
import {
  SSG_TOP_ACCOUNTS,
  MIN_ACCOUNTS_FOR_COUNTRY_RANKING,
} from "../../../../../lib/config";
import { locales } from "../../../../../i18n/config";
import { Link } from "../../../../../i18n/navigation";
import AccountAvatar from "../../../../../components/AccountAvatar";
import MiniRanking from "../../../../../components/MiniRanking";
import ClaimFlow from "../../../../../components/ClaimFlow";
import PlatformIcon from "../../../../../components/PlatformIcon";

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
              <span className="inline-flex items-center rounded-full bg-surface-alt border border-border px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                {account.category}
              </span>
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
              {t("valuePerFan")}
            </p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {formatVPF(account.valuePerFan)}
            </p>
          </div>
          <div className="rounded-lg bg-primary-light px-4 py-4 text-center">
            <p className="text-xs text-text-secondary">
              {t("totalValueLabel")}
            </p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {formatCurrency(account.totalValue)}
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-5">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
            {t("performanceSectionTitle")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
            <MetricCard
              label={t("engRateLabel")}
              value={`${(account.engRate * 100).toFixed(2)}%`}
            />
          </div>
        </div>

      </div>

      {/* Rankings Section */}
      <div className="mt-6">
        {/* Global Rankings */}
        <h2 className="text-sm font-bold text-text uppercase tracking-wider mb-4">
          {t("globalRankingsTitle", { count: globalTotal.toLocaleString() })}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <MiniRanking
            above={vpfNeighbors.above}
            current={account}
            below={vpfNeighbors.below}
            metric="vpf"
          />
          <MiniRanking
            above={tvNeighbors.above}
            current={account}
            below={tvNeighbors.below}
            metric="totalValue"
          />
        </div>

        {/* Country Rankings */}
        {showCountryRankings && countryVpf && countryTv && (
          <div className="mt-6">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">
              {account.countryCode && countryCodeToFlag(account.countryCode)}{" "}
              {t("countryRankingsTitle", { country: account.country ?? "", count: countryAccounts.length.toLocaleString() })}
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <MiniRanking
                above={countryVpf.above}
                current={account}
                below={countryVpf.below}
                metric="vpf"
                startRank={countryVpf.currentRank - countryVpf.above.length}
              />
              <MiniRanking
                above={countryTv.above}
                current={account}
                below={countryTv.below}
                metric="totalValue"
                startRank={countryTv.currentRank - countryTv.above.length}
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

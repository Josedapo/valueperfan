import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  getAccountsData,
  getAccount,
  getNeighbors,
} from "../../../../../lib/data";
import {
  formatCurrency,
  formatVPF,
  formatFollowers,
} from "../../../../../lib/utils";
import {
  categoryToSlug,
  categoryPluralLabel,
} from "../../../../../lib/categories";
import { locales } from "../../../../../i18n/config";
import { Link } from "../../../../../i18n/navigation";
import AccountAvatar from "../../../../../components/AccountAvatar";
import MiniRanking from "../../../../../components/MiniRanking";
import ClaimFlow from "../../../../../components/ClaimFlow";
import PlatformIcon from "../../../../../components/PlatformIcon";

// Pre-render top 200 accounts (by VPF rank) per locale for fast initial load + SEO.
// Remaining accounts are generated on-demand via ISR and cached for 24h.
export async function generateStaticParams() {
  const data = getAccountsData();
  const top = data.accounts
    .filter((a) => a.rank.vpf <= 200);
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

  const platformLabel =
    account.platform === "instagram" ? "Instagram" : "TikTok";
  const title = t("metaTitle", {
    name: account.name,
    handle: account.handle,
    platform: platformLabel,
    vpf: formatVPF(account.valuePerFan),
  });
  const description = t("metaDescription", {
    name: account.name,
    platform: platformLabel,
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
  const platformLabel =
    account.platform === "instagram" ? "Instagram" : "TikTok";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: t("jsonLdName", { name: account.name, platform: platformLabel }),
    description: t("jsonLdDescription", {
      name: account.name,
      platform: platformLabel,
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
        <Link
          href={`/ranking/${categoryToSlug(account.category)}`}
          className="hover:text-primary transition-colors"
        >
          {categoryPluralLabel(account.category)}
        </Link>
        <span className="mx-2">/</span>
        <span className="capitalize">{platformLabel}</span>
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
              </h1>
              <PlatformIcon platform={account.platform} size={22} />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-text-secondary">@{account.handle}</p>
              <Link
                href={`/ranking/${categoryToSlug(account.category)}`}
                className="inline-flex items-center rounded-full bg-surface-alt border border-border px-2.5 py-0.5 text-xs font-medium text-text-secondary hover:text-primary hover:border-primary transition-colors"
              >
                {account.category}
              </Link>
            </div>
            {account.profileUrl && (
              <a
                href={account.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm text-primary hover:text-primary-dark transition-colors"
              >
                {t("viewOn", { platform: platformLabel })}
              </a>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            label={t("valuePerFan")}
            value={formatVPF(account.valuePerFan)}
            highlight
          />
          <MetricCard
            label={t("totalValueLabel")}
            value={formatCurrency(account.totalValue)}
          />
          <MetricCard
            label={t("followersLabel")}
            value={formatFollowers(account.followers)}
          />
          <MetricCard
            label={t("postsLabel")}
            value={account.posts.toLocaleString()}
          />
        </div>

        {/* Ranking Positions */}
        <div className="mt-4 flex gap-4">
          <div className="flex-1 rounded-lg bg-primary-light px-4 py-3 text-center">
            <p className="text-xs text-text-secondary">{t("rankByVpf")}</p>
            <p className="text-xl font-bold text-primary">
              #{account.rank.vpf}
            </p>
          </div>
          <div className="flex-1 rounded-lg bg-surface-alt px-4 py-3 text-center">
            <p className="text-xs text-text-secondary">
              {t("rankByTotalValue")}
            </p>
            <p className="text-xl font-bold text-text">
              #{account.rank.totalValue}
            </p>
          </div>
        </div>

        {/* PME Context */}
        <div className="mt-4 text-xs text-text-secondary leading-relaxed space-y-1.5">
          <p>{t("pmeContext1")}</p>
          <p>{t("pmeContext2")}</p>
          {account.platform === "instagram" && (
            <p>{t("instagramStoriesNote")}</p>
          )}
        </div>
      </div>

      {/* Claim Flow — full width */}
      <div className="mt-6">
        <ClaimFlow
          platform={account.platform}
          handle={account.handle}
          slug={account.slug}
          name={account.name}
          vpf={formatVPF(account.valuePerFan)}
          rankVpf={account.rank.vpf}
        />
      </div>

      {/* Mini Rankings — VPF + Total Value side by side */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
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
    </div>
  );
}

function MetricCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg px-4 py-3 text-center ${
        highlight ? "bg-primary-light" : "bg-surface-alt"
      }`}
    >
      <p className="text-xs text-text-secondary">{label}</p>
      <p
        className={`mt-1 text-lg font-bold ${
          highlight ? "text-primary" : "text-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

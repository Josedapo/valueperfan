import { notFound } from "next/navigation";
import Link from "next/link";
import { getAccountsData, getAccount, getNeighbors } from "../../../../lib/data";
import {
  formatCurrency,
  formatVPF,
  formatFollowers,
} from "../../../../lib/utils";
import AccountAvatar from "../../../../components/AccountAvatar";
import MiniRanking from "../../../../components/MiniRanking";
import ClaimFlow from "../../../../components/ClaimFlow";
import PlatformIcon from "../../../../components/PlatformIcon";

export async function generateStaticParams() {
  const data = getAccountsData();
  return data.accounts.map((account) => ({
    platform: account.platform,
    handle: account.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ platform: string; handle: string }>;
}) {
  const { platform, handle } = await params;
  const account = getAccount(platform, handle);
  if (!account) return { title: "Account Not Found" };

  const platformLabel =
    account.platform === "instagram" ? "Instagram" : "TikTok";
  const title = `${account.name} (@${account.handle}) ${platformLabel} Value — ${formatVPF(account.valuePerFan)}/1K fans`;
  const description = `See the real economic value of ${account.name}'s ${platformLabel} account. Value Per 1K Fans: ${formatVPF(account.valuePerFan)}. Total Value: ${formatCurrency(account.totalValue)}. Ranked #${account.rank.vpf} out of ${getAccountsData().meta.platforms[account.platform]} accounts.`;
  const url = `https://valueperfan.com/account/${account.platform}/${account.slug}`;

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
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ platform: string; handle: string }>;
}) {
  const { platform, handle } = await params;
  const account = getAccount(platform, handle);

  if (!account) {
    notFound();
  }

  const vpfNeighbors = getNeighbors(account, 3, "vpf");
  const tvNeighbors = getNeighbors(account, 3, "totalValue");
  const platformLabel =
    account.platform === "instagram" ? "Instagram" : "TikTok";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${account.name} - ${platformLabel} Value Per Fan`,
    description: `Economic valuation of ${account.name}'s ${platformLabel} account`,
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
          Rankings
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
            <p className="text-text-secondary">@{account.handle}</p>
            {account.profileUrl && (
              <a
                href={account.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm text-primary hover:text-primary-dark transition-colors"
              >
                View on {platformLabel} →
              </a>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            label="Value Per 1K Fans"
            value={formatVPF(account.valuePerFan)}
            highlight
          />
          <MetricCard
            label="Total Value (Last 30 days)"
            value={formatCurrency(account.totalValue)}
          />
          <MetricCard
            label="Followers"
            value={formatFollowers(account.followers)}
          />
          <MetricCard
            label="Posts (Last 30 days)"
            value={account.posts.toLocaleString()}
          />
        </div>

        {/* Ranking Positions */}
        <div className="mt-4 flex gap-4">
          <div className="flex-1 rounded-lg bg-primary-light px-4 py-3 text-center">
            <p className="text-xs text-text-secondary">Rank by Value/1K Fans</p>
            <p className="text-xl font-bold text-primary">
              #{account.rank.vpf}
            </p>
          </div>
          <div className="flex-1 rounded-lg bg-surface-alt px-4 py-3 text-center">
            <p className="text-xs text-text-secondary">Rank by Total Value</p>
            <p className="text-xl font-bold text-text">
              #{account.rank.totalValue}
            </p>
          </div>
        </div>

        {/* PME Context */}
        <div className="mt-4 text-xs text-text-secondary leading-relaxed space-y-1.5">
          <p>
            This valuation represents what brands would pay in paid media to
            match the results this content delivers organically.
          </p>
          <p>
            Calculated using Paid Media Equivalence (PME), the standard used
            across professional sports and entertainment.
          </p>
          {account.platform === "instagram" && (
            <p>
              Instagram Stories are not included due to their ephemeral nature.
            </p>
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

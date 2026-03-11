import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAccountsData } from "../../lib/data";
import { getCountries } from "../../lib/countries";
import { getCategories } from "../../lib/categories";
import { buildRankingMetadata } from "../../lib/metadata";
import { ITEMS_PER_PAGE } from "../../lib/config";
import { formatDataMonth } from "../../lib/utils";
import HomepageRankingTable from "../../components/HomepageRankingTable";
import LazySearchBar from "../../components/LazySearchBar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return buildRankingMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    path: "/",
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const data = getAccountsData();
  const countries = getCountries().map((c) => ({ name: c.name, slug: c.slug }));
  const categories = getCategories().map((c) => ({ name: c.name, slug: c.slug }));

  // Pre-filter initial page: Instagram sorted by totalValue rank
  const initialFiltered = data.accounts
    .filter((a) => a.platform === "instagram")
    .sort((a, b) => a.rank.totalValue - b.rank.totalValue);
  const initialAccounts = initialFiltered.slice(0, ITEMS_PER_PAGE);
  const initialTotalCount = initialFiltered.length;

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ValuePerFan",
    url: "https://valueperfan.com",
    logo: "https://valueperfan.com/favicon.svg",
    description:
      "Public economic valuations of social media accounts using Paid Media Equivalence (PME). Ranking creators by Value Per Fan — the democratic metric that normalizes economic value by follower count.",
  };

  const localePath = locale === "en" ? "" : `/${locale}`;
  const formattedDataMonth = formatDataMonth(data.meta.dataMonth, locale);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: initialAccounts.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.name,
      url: `https://valueperfan.com${localePath}/account/${a.platform}/${a.slug}`,
    })),
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ValuePerFan",
    url: "https://valueperfan.com",
    description:
      "Discover the real economic value of any social media account. Free public rankings based on PME (Paid Media Equivalence) for Instagram and TikTok.",
    inLanguage: ["en", "es", "pt-BR"],
  };

  return (
    <div className="flex flex-col gap-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd),
        }}
      />

      {/* Block 1: Tagline */}
      <section className="text-center py-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-text">
          {t.rich("title", {
            highlight: (chunks) => (
              <span className="text-primary">{chunks}</span>
            ),
          })}
        </h1>
        <p className="mt-3 text-lg text-text-secondary max-w-2xl mx-auto">
          {t.rich("subtitle", {
            highlight: (chunks) => (
              <span className="font-semibold text-primary underline">
                {chunks}
              </span>
            ),
          })}
        </p>
      </section>

      {/* Block 2: Search */}
      <section className="max-w-xl mx-auto w-full">
        <LazySearchBar />
      </section>

      {/* Block 3: Ranking */}
      <Suspense>
        <HomepageRankingTable
          initialAccounts={initialAccounts}
          initialTotalCount={initialTotalCount}
          countries={countries}
          categories={categories}
        />
      </Suspense>
      <p className="text-xs text-text-muted text-right">
        {t("dataFrom", { month: formattedDataMonth })}
      </p>

      {/* Block 4: PME + VPF Explainer */}
      <section className="w-full grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
            {t("pmeTitle")}
          </h2>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            {t("pmeDescription")}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
            {t("vpfTitle")}
          </h2>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            {t("vpfDescription")}
          </p>
        </div>
      </section>

      {/* Block 5: How it works */}
      <section className="w-full">
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
            {t("howItWorksTitle")}
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-text">{t("howItWorksStep1Title")}</p>
              <p className="mt-1 text-sm text-text-secondary leading-relaxed">{t("howItWorksStep1")}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-text">{t("howItWorksStep2Title")}</p>
              <p className="mt-1 text-sm text-text-secondary leading-relaxed">{t("howItWorksStep2")}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-text">{t("howItWorksStep3Title")}</p>
              <p className="mt-1 text-sm text-text-secondary leading-relaxed">{t("howItWorksStep3")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Block 6: Why Value Per Fan matters */}
      <section className="w-full">
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
            {t("whyVpfTitle")}
          </h2>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            {t("whyVpfDescription")}
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <p className="text-xs text-text-muted text-center">{t("disclaimer")}</p>
    </div>
  );
}

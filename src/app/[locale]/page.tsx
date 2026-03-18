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
import FaqSection from "../../components/FaqSection";

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
  const tCountries = await getTranslations("countries");
  const tCategories = await getTranslations("categories");
  const data = getAccountsData();
  const countries = getCountries()
    .map((c) => ({ name: c.name, slug: c.slug }))
    .sort((a, b) => {
      if (a.name === "Global") return 1;
      if (b.name === "Global") return -1;
      return tCountries(a.name).localeCompare(tCountries(b.name), locale);
    });
  const categories = getCategories()
    .map((c) => ({ name: c.name, slug: c.slug }))
    .sort((a, b) => tCategories(a.name).localeCompare(tCategories(b.name), locale));

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
    logo: "https://valueperfan.com/images/brand/vpf-imago-color.png",
    description:
      "Calculate the real value of any social media account. Free economic valuations powered by Paid Media Equivalence (PME) for Instagram and TikTok. Rankings by Value Per Fan — the democratic metric.",
  };

  const localePath = locale === "en" ? "" : `/${locale}`;
  const formattedDataMonth = formatDataMonth(data.meta.dataMonth, locale);
  const formattedPublished = formatDataMonth("2026-03", locale);

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

  const faqItems = Array.from({ length: 6 }, (_, i) => ({
    question: t(`faq${i + 1}Q`),
    answer: t(`faq${i + 1}A`),
  }));

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

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ValuePerFan",
    url: "https://valueperfan.com",
    description:
      "Free social media value calculator. Calculate the real economic value of any Instagram or TikTok account using Paid Media Equivalence (PME).",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />

      {/* Block 1: Tagline */}
      <section className="text-center py-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-text">
          {t.rich("title", {
            highlight: (chunks) => (
              <span className="text-primary">{chunks}</span>
            ),
            br: () => <br />,
          })}
        </h1>
        <p className="mt-3 text-lg text-text-secondary max-w-2xl mx-auto">
          {t.rich("subtitle", {
            highlight: (chunks) => (
              <span className="font-semibold text-primary underline">
                {chunks}
              </span>
            ),
            br: () => <br />,
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
        {t("dataFrom", { month: formattedDataMonth, published: formattedPublished })}
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

      {/* Block 7: FAQ */}
      <section className="w-full">
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">
            {t("faqTitle")}
          </h2>
          <FaqSection items={faqItems} />
        </div>
      </section>

      {/* Disclaimer */}
      <p className="text-xs text-text-muted text-center">{t("disclaimer")}</p>
    </div>
  );
}

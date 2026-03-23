import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAccountsData } from "../../../../../../lib/data";
import { slugToCountry } from "../../../../../../lib/countries";
import { getCategories, slugToCategory, mapCategory, getCategoryCountries } from "../../../../../../lib/categories";
import { buildRankingMetadata } from "../../../../../../lib/metadata";
import { ITEMS_PER_PAGE } from "../../../../../../lib/config";
import type { Platform } from "../../../../../../lib/platform";
import { formatDataMonth } from "../../../../../../lib/utils";
import { locales } from "../../../../../../i18n/config";
import Breadcrumbs from "../../../../../../components/Breadcrumbs";
import RankingTable from "../../../../../../components/RankingTable";

export async function generateStaticParams() {
  const categories = getCategories();
  return locales.flatMap((locale) =>
    categories.flatMap((cat) =>
      getCategoryCountries(cat.name).map((country) => ({
        locale,
        category: cat.slug,
        country: country.slug,
      }))
    )
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; category: string; country: string }>;
  searchParams: Promise<{ page?: string; platform?: string }>;
}) {
  const { locale, category: catSlug, country: countrySlug } = await params;
  const { page: pageParam, platform: platformParam } = await searchParams;
  const categoryInfo = slugToCategory(catSlug);
  const countryInfo = slugToCountry(countrySlug);
  const t = await getTranslations({ locale, namespace: "ranking" });
  const tCategories = await getTranslations({ locale, namespace: "categories" });
  const tCountries = await getTranslations({ locale, namespace: "countries" });

  if (!categoryInfo || !countryInfo) return { title: t("notFound") };

  const page = Math.max(1, parseInt(pageParam || "1", 10)) || 1;
  const platform: Platform = platformParam === "tiktok" ? "tiktok" : "instagram";
  const data = getAccountsData();
  const platformCount = data.accounts.filter(
    (a) =>
      a.platform === platform &&
      mapCategory(a.category) === categoryInfo.name &&
      a.country === countryInfo.name
  ).length;
  const totalPages = Math.ceil(platformCount / ITEMS_PER_PAGE);

  const translatedCategory = tCategories.has(categoryInfo.name) ? tCategories(categoryInfo.name) : categoryInfo.name;
  const translatedCountry = tCountries.has(countryInfo.name) ? tCountries(countryInfo.name) : countryInfo.name;
  return buildRankingMetadata({
    locale,
    title: t("categoryCountryMetaTitle", { category: translatedCategory, country: translatedCountry }),
    description: t("categoryCountryMetaDescription", { category: translatedCategory, country: translatedCountry }),
    path: `/ranking/topic/${catSlug}/${countrySlug}`,
    page,
    totalPages,
    platform,
  });
}

export default async function CategoryCountryRankingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; category: string; country: string }>;
  searchParams: Promise<{ page?: string; platform?: string }>;
}) {
  const { locale, category: catSlug, country: countrySlug } = await params;
  const { page: pageParam, platform: platformParam } = await searchParams;
  setRequestLocale(locale);
  const categoryInfo = slugToCategory(catSlug);
  const countryInfo = slugToCountry(countrySlug);
  if (!categoryInfo || !countryInfo) notFound();

  const page = Math.max(1, parseInt(pageParam || "1", 10)) || 1;
  const platform: Platform = platformParam === "tiktok" ? "tiktok" : "instagram";
  const data = getAccountsData();
  const filtered = data.accounts.filter(
    (a) =>
      mapCategory(a.category) === categoryInfo.name &&
      a.country === countryInfo.name
  );

  const t = await getTranslations("ranking");
  const tNav = await getTranslations("nav");
  const tCategories = await getTranslations("categories");
  const tCountries = await getTranslations("countries");

  const categoryCountries = getCategoryCountries(categoryInfo.name)
    .map((c) => ({ name: c.name, slug: c.slug }))
    .sort((a, b) => {
      if (a.name === "Global") return 1;
      if (b.name === "Global") return -1;
      return tCountries(a.name).localeCompare(tCountries(b.name), locale);
    });

  const categories = getCategories()
    .map((c) => ({ name: c.name, slug: c.slug }))
    .sort((a, b) => tCategories(a.name).localeCompare(tCategories(b.name), locale));

  const platformSorted = filtered
    .filter((a) => a.platform === platform)
    .sort((a, b) => a.rank.totalValue - b.rank.totalValue);
  const totalPages = Math.ceil(platformSorted.length / ITEMS_PER_PAGE);
  const basePath = `/ranking/topic/${catSlug}/${countrySlug}`;
  const formattedDataMonth = formatDataMonth(data.meta.dataMonth, locale);
  const formattedPublished = formatDataMonth("2026-03", locale);

  const localePath = locale === "en" ? "" : `/${locale}`;
  const itemListJsonLd = page === 1 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: platformSorted.slice(0, ITEMS_PER_PAGE).map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.name,
      url: `https://valueperfan.com${localePath}/account/${a.platform}/${a.slug}`,
    })),
  } : null;

  function paginationHref(pg: number): string {
    const p = new URLSearchParams();
    if (platform === "tiktok") p.set("platform", "tiktok");
    if (pg > 1) p.set("page", String(pg));
    const qs = p.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const translatedCategory = tCategories.has(categoryInfo.name) ? tCategories(categoryInfo.name) : categoryInfo.name;
  const translatedCountry = tCountries.has(countryInfo.name) ? tCountries(countryInfo.name) : countryInfo.name;
  const breadcrumbItems = [
    { label: tNav("rankings"), href: "/" },
    { label: translatedCategory, href: `/ranking/topic/${catSlug}` },
    { label: translatedCountry },
  ];

  return (
    <div className="flex flex-col gap-8 pt-6">
      <Breadcrumbs items={breadcrumbItems} locale={locale} />
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      {page > 1 && (
        <link rel="prev" href={paginationHref(page - 1)} />
      )}
      {page < totalPages && (
        <link rel="next" href={paginationHref(page + 1)} />
      )}
      <RankingTable
        accounts={filtered}
        countries={categoryCountries}
        currentCountrySlug={countrySlug}
        categories={categories}
        currentCategorySlug={catSlug}
        categoryName={categoryInfo.name}
        countryName={countryInfo.name}
        initialPage={page}
        initialPlatform={platform}
        introText={t("categoryCountryIntro", { category: tCategories.has(categoryInfo.name) ? tCategories(categoryInfo.name) : categoryInfo.name, country: tCountries.has(countryInfo.name) ? tCountries(countryInfo.name) : countryInfo.name, count: filtered.length.toLocaleString() })}
        dataMonth={formattedDataMonth}
      />
      <p className="text-xs text-text-muted text-right">
        {t("dataFrom", { month: formattedDataMonth, published: formattedPublished })}
      </p>
    </div>
  );
}

import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAccountsData } from "../../../../lib/data";
import {
  getCountries,
  slugToCountry,
  getMajorCountryNames,
  OTHER_COUNTRIES_SLUG,
} from "../../../../lib/countries";
import { getCategories } from "../../../../lib/categories";
import { buildRankingMetadata } from "../../../../lib/metadata";
import { ITEMS_PER_PAGE } from "../../../../lib/config";
import type { Platform } from "../../../../lib/platform";
import { formatDataMonth } from "../../../../lib/utils";
import { locales } from "../../../../i18n/config";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import RankingTable from "../../../../components/RankingTable";

export async function generateStaticParams() {
  const countries = getCountries();
  return locales.flatMap((locale) =>
    countries.map(({ slug }) => ({ locale, country: slug }))
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; country: string }>;
  searchParams: Promise<{ page?: string; platform?: string }>;
}) {
  const { locale, country: slug } = await params;
  const { page: pageParam, platform: platformParam } = await searchParams;
  const countryInfo = slugToCountry(slug);
  const t = await getTranslations({ locale, namespace: "ranking" });
  const tCountries = await getTranslations({ locale, namespace: "countries" });

  if (!countryInfo) return { title: t("notFound") };

  const page = Math.max(1, parseInt(pageParam || "1", 10)) || 1;
  const platform: Platform = platformParam === "tiktok" ? "tiktok" : "instagram";
  const data = getAccountsData();
  const isOther = slug === OTHER_COUNTRIES_SLUG;
  const platformCount = isOther
    ? (() => {
        const majorNames = getMajorCountryNames();
        return data.accounts.filter(
          (a) => a.platform === platform && a.country && !majorNames.has(a.country)
        ).length;
      })()
    : data.accounts.filter(
        (a) => a.platform === platform && a.country === countryInfo.name
      ).length;
  const totalPages = Math.ceil(platformCount / ITEMS_PER_PAGE);

  const translatedCountry = tCountries.has(countryInfo.name) ? tCountries(countryInfo.name) : countryInfo.name;
  return buildRankingMetadata({
    locale,
    title: t("countryMetaTitle", { country: translatedCountry }),
    description: t("countryMetaDescription", { country: translatedCountry }),
    path: `/ranking/${slug}`,
    page,
    totalPages,
    platform,
  });
}

export default async function CountryRankingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; country: string }>;
  searchParams: Promise<{ page?: string; platform?: string }>;
}) {
  const { locale, country: slug } = await params;
  const { page: pageParam, platform: platformParam } = await searchParams;
  setRequestLocale(locale);
  const countryInfo = slugToCountry(slug);
  if (!countryInfo) notFound();

  const page = Math.max(1, parseInt(pageParam || "1", 10)) || 1;
  const platform: Platform = platformParam === "tiktok" ? "tiktok" : "instagram";
  const data = getAccountsData();
  const isOther = slug === OTHER_COUNTRIES_SLUG;
  const countryAccounts = isOther
    ? (() => {
        const majorNames = getMajorCountryNames();
        return data.accounts.filter(
          (a) => a.country && !majorNames.has(a.country) && a.platform === platform
        );
      })()
    : data.accounts.filter(
        (a) => a.country === countryInfo.name && a.platform === platform
      );
  const t = await getTranslations("ranking");
  const tNav = await getTranslations("nav");
  const tCountries = await getTranslations("countries");
  const tCategories = await getTranslations("categories");
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

  const platformSorted = countryAccounts
    .filter((a) => a.platform === platform)
    .sort((a, b) => a.rank.totalValue - b.rank.totalValue);
  const totalPages = Math.ceil(platformSorted.length / ITEMS_PER_PAGE);
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

  const basePath = `/ranking/${slug}`;
  function paginationHref(pg: number): string {
    const p = new URLSearchParams();
    if (platform === "tiktok") p.set("platform", "tiktok");
    if (pg > 1) p.set("page", String(pg));
    const qs = p.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const translatedCountry = tCountries.has(countryInfo.name) ? tCountries(countryInfo.name) : countryInfo.name;
  const breadcrumbItems = [
    { label: tNav("rankings"), href: "/" },
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
        accounts={countryAccounts}
        countries={countries}
        currentCountrySlug={slug}
        categories={categories}
        countryName={countryInfo.name}
        initialPage={page}
        initialPlatform={platform}
        introText={t("countryIntro", { country: tCountries.has(countryInfo.name) ? tCountries(countryInfo.name) : countryInfo.name, count: countryAccounts.length.toLocaleString() })}
        dataMonth={formattedDataMonth}
      />
      <p className="text-xs text-text-muted text-right">
        {t("dataFrom", { month: formattedDataMonth, published: formattedPublished })}
      </p>
    </div>
  );
}

import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAccountsData } from "../../../../../lib/data";
import { getCategories, slugToCategory, mapCategory, getCategoryCountries } from "../../../../../lib/categories";
import { buildRankingMetadata } from "../../../../../lib/metadata";
import { ITEMS_PER_PAGE } from "../../../../../lib/config";
import { formatDataMonth } from "../../../../../lib/utils";
import { locales } from "../../../../../i18n/config";
import Breadcrumbs from "../../../../../components/Breadcrumbs";
import RankingTable from "../../../../../components/RankingTable";

export async function generateStaticParams() {
  const categories = getCategories();
  return locales.flatMap((locale) =>
    categories.map(({ slug }) => ({ locale, category: slug }))
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, category: slug } = await params;
  const { page: pageParam } = await searchParams;
  const categoryInfo = slugToCategory(slug);
  const t = await getTranslations({ locale, namespace: "ranking" });
  const tCategories = await getTranslations({ locale, namespace: "categories" });

  if (!categoryInfo) return { title: t("notFound") };

  const page = Math.max(1, parseInt(pageParam || "1", 10)) || 1;
  const data = getAccountsData();
  const instagramCount = data.accounts.filter(
    (a) => a.platform === "instagram" && mapCategory(a.category) === categoryInfo.name
  ).length;
  const totalPages = Math.ceil(instagramCount / ITEMS_PER_PAGE);

  const translatedCategory = tCategories.has(categoryInfo.name) ? tCategories(categoryInfo.name) : categoryInfo.name;
  return buildRankingMetadata({
    locale,
    title: t("categoryMetaTitle", { category: translatedCategory }),
    description: t("categoryMetaDescription", { category: translatedCategory }),
    path: `/ranking/topic/${slug}`,
    page,
    totalPages,
  });
}

export default async function CategoryRankingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, category: slug } = await params;
  const { page: pageParam } = await searchParams;
  setRequestLocale(locale);
  const categoryInfo = slugToCategory(slug);
  if (!categoryInfo) notFound();

  const page = Math.max(1, parseInt(pageParam || "1", 10)) || 1;
  const data = getAccountsData();
  const categoryAccounts = data.accounts.filter(
    (a) => mapCategory(a.category) === categoryInfo.name
  );

  const t = await getTranslations("ranking");
  const tNav = await getTranslations("nav");
  const tCategories = await getTranslations("categories");
  const tCountries = await getTranslations("countries");

  // Countries that have accounts in this category
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

  const instagramSorted = categoryAccounts
    .filter((a) => a.platform === "instagram")
    .sort((a, b) => a.rank.totalValue - b.rank.totalValue);
  const instagramCount = instagramSorted.length;
  const totalPages = Math.ceil(instagramCount / ITEMS_PER_PAGE);
  const formattedDataMonth = formatDataMonth(data.meta.dataMonth, locale);
  const formattedPublished = formatDataMonth("2026-03", locale);

  const localePath = locale === "en" ? "" : `/${locale}`;
  const itemListJsonLd = page === 1 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: instagramSorted.slice(0, ITEMS_PER_PAGE).map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.name,
      url: `https://valueperfan.com${localePath}/account/${a.platform}/${a.slug}`,
    })),
  } : null;

  const translatedCategory = tCategories.has(categoryInfo.name) ? tCategories(categoryInfo.name) : categoryInfo.name;
  const breadcrumbItems = [
    { label: tNav("rankings"), href: "/" },
    { label: translatedCategory },
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
        <link rel="prev" href={page === 2 ? `/ranking/topic/${slug}` : `/ranking/topic/${slug}?page=${page - 1}`} />
      )}
      {page < totalPages && (
        <link rel="next" href={`/ranking/topic/${slug}?page=${page + 1}`} />
      )}
      <RankingTable
        accounts={categoryAccounts}
        countries={categoryCountries}
        categories={categories}
        currentCategorySlug={slug}
        categoryName={categoryInfo.name}
        initialPage={page}
        introText={t("categoryIntro", { category: tCategories.has(categoryInfo.name) ? tCategories(categoryInfo.name) : categoryInfo.name, count: categoryAccounts.length.toLocaleString() })}
        dataMonth={formattedDataMonth}
      />
      <p className="text-xs text-text-muted text-right">
        {t("dataFrom", { month: formattedDataMonth, published: formattedPublished })}
      </p>
    </div>
  );
}

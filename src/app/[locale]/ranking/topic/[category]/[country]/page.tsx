import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAccountsData } from "../../../../../../lib/data";
import { slugToCountry } from "../../../../../../lib/countries";
import { getCategories, slugToCategory, mapCategory, getCategoryCountries } from "../../../../../../lib/categories";
import { buildRankingMetadata } from "../../../../../../lib/metadata";
import { ITEMS_PER_PAGE } from "../../../../../../lib/config";
import { locales } from "../../../../../../i18n/config";
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
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, category: catSlug, country: countrySlug } = await params;
  const { page: pageParam } = await searchParams;
  const categoryInfo = slugToCategory(catSlug);
  const countryInfo = slugToCountry(countrySlug);
  const t = await getTranslations({ locale, namespace: "ranking" });
  const tCategories = await getTranslations({ locale, namespace: "categories" });
  const tCountries = await getTranslations({ locale, namespace: "countries" });

  if (!categoryInfo || !countryInfo) return { title: t("notFound") };

  const page = Math.max(1, parseInt(pageParam || "1", 10)) || 1;
  const data = getAccountsData();
  const instagramCount = data.accounts.filter(
    (a) =>
      a.platform === "instagram" &&
      mapCategory(a.category) === categoryInfo.name &&
      a.country === countryInfo.name
  ).length;
  const totalPages = Math.ceil(instagramCount / ITEMS_PER_PAGE);

  const translatedCategory = tCategories.has(categoryInfo.name) ? tCategories(categoryInfo.name) : categoryInfo.name;
  const translatedCountry = tCountries.has(countryInfo.name) ? tCountries(countryInfo.name) : countryInfo.name;
  return buildRankingMetadata({
    locale,
    title: t("categoryCountryMetaTitle", { category: translatedCategory, country: translatedCountry }),
    description: t("categoryCountryMetaDescription", { category: translatedCategory, country: translatedCountry }),
    path: `/ranking/topic/${catSlug}/${countrySlug}`,
    page,
    totalPages,
  });
}

export default async function CategoryCountryRankingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; category: string; country: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, category: catSlug, country: countrySlug } = await params;
  const { page: pageParam } = await searchParams;
  setRequestLocale(locale);
  const categoryInfo = slugToCategory(catSlug);
  const countryInfo = slugToCountry(countrySlug);
  if (!categoryInfo || !countryInfo) notFound();

  const page = Math.max(1, parseInt(pageParam || "1", 10)) || 1;
  const data = getAccountsData();
  const filtered = data.accounts.filter(
    (a) =>
      mapCategory(a.category) === categoryInfo.name &&
      a.country === countryInfo.name
  );

  const categoryCountries = getCategoryCountries(categoryInfo.name).map((c) => ({
    name: c.name,
    slug: c.slug,
  }));

  const categories = getCategories().map((c) => ({ name: c.name, slug: c.slug }));

  const instagramCount = filtered.filter(
    (a) => a.platform === "instagram"
  ).length;
  const totalPages = Math.ceil(instagramCount / ITEMS_PER_PAGE);
  const basePath = `/ranking/topic/${catSlug}/${countrySlug}`;

  return (
    <div className="flex flex-col gap-8 pt-6">
      {page > 1 && (
        <link rel="prev" href={page === 2 ? basePath : `${basePath}?page=${page - 1}`} />
      )}
      {page < totalPages && (
        <link rel="next" href={`${basePath}?page=${page + 1}`} />
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
      />
    </div>
  );
}

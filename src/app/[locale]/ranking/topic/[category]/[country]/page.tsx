import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAccountsData } from "../../../../../../lib/data";
import { slugToCountry } from "../../../../../../lib/countries";
import { getCategories, slugToCategory, mapCategory, getCategoryCountries } from "../../../../../../lib/categories";
import { buildRankingMetadata } from "../../../../../../lib/metadata";
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
}: {
  params: Promise<{ locale: string; category: string; country: string }>;
}) {
  const { locale, category: catSlug, country: countrySlug } = await params;
  const categoryInfo = slugToCategory(catSlug);
  const countryInfo = slugToCountry(countrySlug);
  const t = await getTranslations({ locale, namespace: "ranking" });
  const tCategories = await getTranslations({ locale, namespace: "categories" });
  const tCountries = await getTranslations({ locale, namespace: "countries" });

  if (!categoryInfo || !countryInfo) return { title: t("notFound") };

  const translatedCategory = tCategories.has(categoryInfo.name) ? tCategories(categoryInfo.name) : categoryInfo.name;
  const translatedCountry = tCountries.has(countryInfo.name) ? tCountries(countryInfo.name) : countryInfo.name;
  return buildRankingMetadata({
    locale,
    title: t("categoryCountryMetaTitle", { category: translatedCategory, country: translatedCountry }),
    description: t("categoryCountryMetaDescription", { category: translatedCategory, country: translatedCountry }),
    path: `/ranking/topic/${catSlug}/${countrySlug}`,
  });
}

export default async function CategoryCountryRankingPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; country: string }>;
}) {
  const { locale, category: catSlug, country: countrySlug } = await params;
  setRequestLocale(locale);
  const categoryInfo = slugToCategory(catSlug);
  const countryInfo = slugToCountry(countrySlug);
  if (!categoryInfo || !countryInfo) notFound();

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

  return (
    <div className="flex flex-col gap-8 pt-6">
      <RankingTable
        accounts={filtered}
        countries={categoryCountries}
        currentCountrySlug={countrySlug}
        categories={categories}
        currentCategorySlug={catSlug}
        categoryName={categoryInfo.name}
        countryName={countryInfo.name}
      />
    </div>
  );
}

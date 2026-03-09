import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAccountsData } from "../../../../../../lib/data";
import { slugToCountry, countryToSlug } from "../../../../../../lib/countries";
import { getCategories, slugToCategory, mapCategory, getCategoryCountries } from "../../../../../../lib/categories";
import { locales } from "../../../../../../i18n/config";
import RankingTable from "../../../../../../components/RankingTable";
import SearchBar from "../../../../../../components/SearchBar";

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

  if (!categoryInfo || !countryInfo) return { title: t("notFound") };

  const title = t("categoryCountryMetaTitle", {
    category: categoryInfo.name,
    country: countryInfo.name,
  });
  const description = t("categoryCountryMetaDescription", {
    category: categoryInfo.name,
    country: countryInfo.name,
  });
  const url = `https://valueperfan.com${locale === "en" ? "" : `/${locale}`}/ranking/category/${catSlug}/${countrySlug}`;

  return {
    title,
    description,
    openGraph: { title, description, url, siteName: "ValuePerFan" },
    twitter: { card: "summary" as const, title, description },
    alternates: {
      canonical: url,
      languages: {
        en: `https://valueperfan.com/ranking/category/${catSlug}/${countrySlug}`,
        es: `https://valueperfan.com/es/ranking/category/${catSlug}/${countrySlug}`,
        "pt-BR": `https://valueperfan.com/br/ranking/category/${catSlug}/${countrySlug}`,
      },
    },
  };
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
    <div className="flex flex-col gap-8">
      <section className="max-w-xl mx-auto w-full pt-6">
        <SearchBar />
      </section>

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

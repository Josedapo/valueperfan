import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAccountsData } from "../../../../../lib/data";
import { getCountries, countryToSlug } from "../../../../../lib/countries";
import { getCategories, slugToCategory, mapCategory, getCategoryCountries } from "../../../../../lib/categories";
import { locales } from "../../../../../i18n/config";
import RankingTable from "../../../../../components/RankingTable";
import SearchBar from "../../../../../components/SearchBar";

export async function generateStaticParams() {
  const categories = getCategories();
  return locales.flatMap((locale) =>
    categories.map(({ slug }) => ({ locale, category: slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category: slug } = await params;
  const categoryInfo = slugToCategory(slug);
  const t = await getTranslations({ locale, namespace: "ranking" });

  if (!categoryInfo) return { title: t("notFound") };

  const title = t("categoryMetaTitle", { category: categoryInfo.name });
  const description = t("categoryMetaDescription", { category: categoryInfo.name });
  const url = `https://valueperfan.com${locale === "en" ? "" : `/${locale}`}/ranking/category/${slug}`;

  return {
    title,
    description,
    openGraph: { title, description, url, siteName: "ValuePerFan" },
    twitter: { card: "summary" as const, title, description },
    alternates: {
      canonical: url,
      languages: {
        en: `https://valueperfan.com/ranking/category/${slug}`,
        es: `https://valueperfan.com/es/ranking/category/${slug}`,
        "pt-BR": `https://valueperfan.com/br/ranking/category/${slug}`,
      },
    },
  };
}

export default async function CategoryRankingPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category: slug } = await params;
  setRequestLocale(locale);
  const categoryInfo = slugToCategory(slug);
  if (!categoryInfo) notFound();

  const data = getAccountsData();
  const categoryAccounts = data.accounts.filter(
    (a) => mapCategory(a.category) === categoryInfo.name
  );

  // Countries that have accounts in this category
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
        accounts={categoryAccounts}
        countries={categoryCountries}
        categories={categories}
        currentCategorySlug={slug}
        categoryName={categoryInfo.name}
      />
    </div>
  );
}

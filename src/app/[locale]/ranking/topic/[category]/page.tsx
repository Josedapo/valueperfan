import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAccountsData } from "../../../../../lib/data";
import { getCategories, slugToCategory, mapCategory, getCategoryCountries } from "../../../../../lib/categories";
import { buildRankingMetadata } from "../../../../../lib/metadata";
import { locales } from "../../../../../i18n/config";
import RankingTable from "../../../../../components/RankingTable";

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
  const tCategories = await getTranslations({ locale, namespace: "categories" });

  if (!categoryInfo) return { title: t("notFound") };

  const translatedCategory = tCategories.has(categoryInfo.name) ? tCategories(categoryInfo.name) : categoryInfo.name;
  return buildRankingMetadata({
    locale,
    title: t("categoryMetaTitle", { category: translatedCategory }),
    description: t("categoryMetaDescription", { category: translatedCategory }),
    path: `/ranking/topic/${slug}`,
  });
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
    <div className="flex flex-col gap-8 pt-6">
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

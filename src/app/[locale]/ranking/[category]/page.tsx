import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAccountsData } from "../../../../lib/data";
import {
  slugToCategory,
  getCategorySlugs,
  categoryPluralLabel,
} from "../../../../lib/categories";
import { locales } from "../../../../i18n/config";
import RankingTable from "../../../../components/RankingTable";
import SearchBar from "../../../../components/SearchBar";

export async function generateStaticParams() {
  const categorySlugs = getCategorySlugs();
  return locales.flatMap((locale) =>
    categorySlugs.map(({ slug }) => ({ locale, category: slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category: slug } = await params;
  const categoryName = slugToCategory(slug);
  const t = await getTranslations({ locale, namespace: "ranking" });

  if (!categoryName) return { title: t("notFound") };

  const label = categoryPluralLabel(categoryName);
  const title = t("metaTitle", { category: label.toLowerCase() });
  const description = t("metaDescription", { category: label.toLowerCase() });
  const url = `https://valueperfan.com${locale === "en" ? "" : `/${locale}`}/ranking/${slug}`;

  return {
    title,
    description,
    openGraph: { title, description, url, siteName: "ValuePerFan" },
    twitter: { card: "summary" as const, title, description },
    alternates: {
      canonical: url,
      languages: {
        en: `https://valueperfan.com/ranking/${slug}`,
        es: `https://valueperfan.com/es/ranking/${slug}`,
        "pt-BR": `https://valueperfan.com/br/ranking/${slug}`,
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
  const categoryName = slugToCategory(slug);
  if (!categoryName) notFound();

  const t = await getTranslations("ranking");
  const data = getAccountsData();
  const categoryAccounts = data.accounts.filter(
    (a) => a.category === categoryName
  );

  const label = categoryPluralLabel(categoryName);

  return (
    <div className="flex flex-col gap-8">
      <section className="text-center py-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-text">
          {label}{" "}
          <span className="text-primary">{t("titleSuffix")}</span>
        </h1>
        <p className="mt-3 text-lg text-text-secondary max-w-2xl mx-auto">
          {t("subtitle", { category: label.toLowerCase() })}
        </p>
      </section>

      <section className="max-w-xl mx-auto w-full">
        <SearchBar />
      </section>

      <RankingTable accounts={categoryAccounts} showCategoryFilter={false} />
    </div>
  );
}

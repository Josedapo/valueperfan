import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAccountsData } from "../../../../lib/data";
import { getCountries, slugToCountry } from "../../../../lib/countries";
import { getCategories } from "../../../../lib/categories";
import { buildRankingMetadata } from "../../../../lib/metadata";
import { ITEMS_PER_PAGE } from "../../../../lib/config";
import { locales } from "../../../../i18n/config";
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
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, country: slug } = await params;
  const { page: pageParam } = await searchParams;
  const countryInfo = slugToCountry(slug);
  const t = await getTranslations({ locale, namespace: "ranking" });
  const tCountries = await getTranslations({ locale, namespace: "countries" });

  if (!countryInfo) return { title: t("notFound") };

  const page = Math.max(1, parseInt(pageParam || "1", 10)) || 1;
  const data = getAccountsData();
  const instagramCount = data.accounts.filter(
    (a) => a.platform === "instagram" && a.country === countryInfo.name
  ).length;
  const totalPages = Math.ceil(instagramCount / ITEMS_PER_PAGE);

  const translatedCountry = tCountries.has(countryInfo.name) ? tCountries(countryInfo.name) : countryInfo.name;
  return buildRankingMetadata({
    locale,
    title: t("countryMetaTitle", { country: translatedCountry }),
    description: t("countryMetaDescription", { country: translatedCountry }),
    path: `/ranking/${slug}`,
    page,
    totalPages,
  });
}

export default async function CountryRankingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; country: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, country: slug } = await params;
  const { page: pageParam } = await searchParams;
  setRequestLocale(locale);
  const countryInfo = slugToCountry(slug);
  if (!countryInfo) notFound();

  const page = Math.max(1, parseInt(pageParam || "1", 10)) || 1;
  const data = getAccountsData();
  const countryAccounts = data.accounts.filter(
    (a) => a.country === countryInfo.name
  );
  const countries = getCountries().map((c) => ({ name: c.name, slug: c.slug }));
  const categories = getCategories().map((c) => ({ name: c.name, slug: c.slug }));

  const instagramCount = countryAccounts.filter(
    (a) => a.platform === "instagram"
  ).length;
  const totalPages = Math.ceil(instagramCount / ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col gap-8 pt-6">
      {page > 1 && (
        <link rel="prev" href={page === 2 ? `/ranking/${slug}` : `/ranking/${slug}?page=${page - 1}`} />
      )}
      {page < totalPages && (
        <link rel="next" href={`/ranking/${slug}?page=${page + 1}`} />
      )}
      <RankingTable
        accounts={countryAccounts}
        countries={countries}
        currentCountrySlug={slug}
        categories={categories}
        countryName={countryInfo.name}
        initialPage={page}
      />
    </div>
  );
}

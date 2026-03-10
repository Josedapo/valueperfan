import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAccountsData } from "../../../../lib/data";
import { getCountries, slugToCountry } from "../../../../lib/countries";
import { getCategories } from "../../../../lib/categories";
import { buildRankingMetadata } from "../../../../lib/metadata";
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
}: {
  params: Promise<{ locale: string; country: string }>;
}) {
  const { locale, country: slug } = await params;
  const countryInfo = slugToCountry(slug);
  const t = await getTranslations({ locale, namespace: "ranking" });
  const tCountries = await getTranslations({ locale, namespace: "countries" });

  if (!countryInfo) return { title: t("notFound") };

  const translatedCountry = tCountries.has(countryInfo.name) ? tCountries(countryInfo.name) : countryInfo.name;
  return buildRankingMetadata({
    locale,
    title: t("countryMetaTitle", { country: translatedCountry }),
    description: t("countryMetaDescription", { country: translatedCountry }),
    path: `/ranking/${slug}`,
  });
}

export default async function CountryRankingPage({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}) {
  const { locale, country: slug } = await params;
  setRequestLocale(locale);
  const countryInfo = slugToCountry(slug);
  if (!countryInfo) notFound();

  const data = getAccountsData();
  const countryAccounts = data.accounts.filter(
    (a) => a.country === countryInfo.name
  );
  const countries = getCountries().map((c) => ({ name: c.name, slug: c.slug }));
  const categories = getCategories().map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <div className="flex flex-col gap-8 pt-6">
      <RankingTable
        accounts={countryAccounts}
        countries={countries}
        currentCountrySlug={slug}
        categories={categories}
        countryName={countryInfo.name}
      />
    </div>
  );
}

import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAccountsData } from "../../../../lib/data";
import { getCountries, slugToCountry } from "../../../../lib/countries";
import { getCategories } from "../../../../lib/categories";
import { locales } from "../../../../i18n/config";
import RankingTable from "../../../../components/RankingTable";
import SearchBar from "../../../../components/SearchBar";

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

  if (!countryInfo) return { title: t("notFound") };

  const title = t("countryMetaTitle", { country: countryInfo.name });
  const description = t("countryMetaDescription", { country: countryInfo.name });
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
    <div className="flex flex-col gap-8">
      <section className="max-w-xl mx-auto w-full pt-6">
        <SearchBar />
      </section>

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

import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAccountsData } from "../../../../lib/data";
import { getCountries, slugToCountry } from "../../../../lib/countries";
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

  const t = await getTranslations("ranking");
  const data = getAccountsData();
  const countryAccounts = data.accounts.filter(
    (a) => a.country === countryInfo.name
  );
  const countries = getCountries().map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <div className="flex flex-col gap-8">
      <section className="text-center py-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-text">
          {countryInfo.name}{" "}
          <span className="text-primary">{t("titleSuffix")}</span>
        </h1>
        <p className="mt-3 text-lg text-text-secondary max-w-2xl mx-auto">
          {t("countrySubtitle", { country: countryInfo.name })}
        </p>
      </section>

      <section className="max-w-xl mx-auto w-full">
        <SearchBar />
      </section>

      <RankingTable
        accounts={countryAccounts}
        countries={countries}
        currentCountrySlug={slug}
      />
    </div>
  );
}

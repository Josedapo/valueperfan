import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAccountsData } from "../../lib/data";
import { getCountries } from "../../lib/countries";
import { getCategories } from "../../lib/categories";
import RankingTable from "../../components/RankingTable";
import SearchBar from "../../components/SearchBar";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const data = getAccountsData();
  const countries = getCountries().map((c) => ({ name: c.name, slug: c.slug }));
  const categories = getCategories().map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <div className="flex flex-col gap-8">
      {/* Block 1: Tagline */}
      <section className="text-center py-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-text">
          {t.rich("title", {
            highlight: (chunks) => (
              <span className="text-primary">{chunks}</span>
            ),
          })}
        </h1>
        <p className="mt-3 text-lg text-text-secondary max-w-2xl mx-auto">
          {t.rich("subtitle", {
            highlight: (chunks) => (
              <span className="font-semibold text-primary underline">
                {chunks}
              </span>
            ),
          })}
        </p>
      </section>

      {/* Block 2: Search */}
      <section className="max-w-xl mx-auto w-full">
        <SearchBar />
      </section>

      {/* Block 3: Ranking */}
      <RankingTable accounts={data.accounts} countries={countries} categories={categories} />

      {/* Block 4: PME + VPF Explainer */}
      <section className="w-full grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
            {t("pmeTitle")}
          </h2>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            {t("pmeDescription")}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
            {t("vpfTitle")}
          </h2>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            {t("vpfDescription")}
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <p className="text-xs text-text-muted text-center">{t("disclaimer")}</p>
    </div>
  );
}

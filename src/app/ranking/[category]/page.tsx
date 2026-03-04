import { notFound } from "next/navigation";
import { getAccountsData } from "../../../lib/data";
import {
  slugToCategory,
  getCategorySlugs,
  categoryPluralLabel,
} from "../../../lib/categories";
import RankingTable from "../../../components/RankingTable";
import SearchBar from "../../../components/SearchBar";

export async function generateStaticParams() {
  return getCategorySlugs().map(({ slug }) => ({ category: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const categoryName = slugToCategory(slug);
  if (!categoryName) return { title: "Category Not Found" };

  const label = categoryPluralLabel(categoryName);
  const title = `${label} Social Media Value Ranking`;
  const description = `See the real economic value of ${label.toLowerCase()} on social media. Rankings powered by Paid Media Equivalence. Not followers. Not likes. Real money.`;
  const url = `https://valueperfan.com/ranking/${slug}`;

  return {
    title,
    description,
    openGraph: { title, description, url, siteName: "ValuePerFan" },
    twitter: { card: "summary" as const, title, description },
    alternates: { canonical: url },
  };
}

export default async function CategoryRankingPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const categoryName = slugToCategory(slug);
  if (!categoryName) notFound();

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
          <span className="text-primary">Value Ranking</span>
        </h1>
        <p className="mt-3 text-lg text-text-secondary max-w-2xl mx-auto">
          The real economic value of {label.toLowerCase()} on social media.
          Powered by Paid Media Equivalence.
        </p>
      </section>

      <section className="max-w-xl mx-auto w-full">
        <SearchBar />
      </section>

      <RankingTable accounts={categoryAccounts} showCategoryFilter={false} />
    </div>
  );
}

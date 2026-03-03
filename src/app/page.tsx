import { getAccountsData } from "../lib/data";
import RankingTable from "../components/RankingTable";
import SearchBar from "../components/SearchBar";

export default function Home() {
  const data = getAccountsData();

  return (
    <div className="flex flex-col gap-8">
      {/* Block 1: Tagline */}
      <section className="text-center py-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-text">
          The real value of{" "}
          <span className="text-primary">social media</span> followers
        </h1>
        <p className="mt-3 text-lg text-text-secondary max-w-2xl mx-auto">
          Value Per Fan measures the real economic value each follower
          generates. Not followers. Not likes. Not arbitrary scores.{" "}
          <span className="font-semibold text-primary">Real money.</span>
        </p>
      </section>

      {/* Block 2: Search */}
      <section className="max-w-xl mx-auto w-full">
        <SearchBar />
      </section>

      {/* Block 3: Ranking */}
      <RankingTable accounts={data.accounts} />

      {/* Block 4: PME + VPF Explainer */}
      <section className="max-w-3xl mx-auto w-full grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
            Paid Media Equivalence
          </h2>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            Every valuation on ValuePerFan represents what a brand would spend
            on paid media campaigns to achieve the same results that organic
            content delivers. Not a guess. Not a score. The real market value.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
            Value Per Fan
          </h2>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            Total value divided by followers. This simple metric reveals who
            generates the most value per follower — regardless of size. A
            creator with 10,000 engaged followers can rank above a celebrity
            with millions.
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <p className="text-xs text-text-muted text-center">
        All valuations are estimates based on public data and PME (Paid Media
        Equivalence) methodology.
      </p>
    </div>
  );
}

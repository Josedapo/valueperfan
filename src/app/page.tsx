import { getAccountsData } from "../lib/data";
import RankingTable from "../components/RankingTable";
import SearchBar from "../components/SearchBar";
import Sidebar from "../components/Sidebar";

export default function Home() {
  const data = getAccountsData();

  return (
    <div className="flex flex-col gap-8">
      {/* Block 1: Tagline */}
      <section className="text-center py-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-text">
          The Real Economic Value of{" "}
          <span className="text-primary">Every</span> Social Media Account
        </h1>
        <p className="mt-3 text-lg text-text-secondary max-w-2xl mx-auto">
          Rankings powered by Value Per Fan — where a nano-influencer can rank
          above a celebrity based on the real value they generate per follower.
        </p>
      </section>

      {/* Block 2: Search */}
      <section className="max-w-xl mx-auto w-full">
        <SearchBar />
      </section>

      {/* Block 3: Ranking + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8">
        <main className="flex-1 min-w-0">
          <RankingTable accounts={data.accounts} />
        </main>
        <Sidebar />
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-text-muted text-center">
        Instagram Stories are not included in calculations due to their
        ephemeral nature. All valuations are estimates based on public data and
        PME (Paid Media Equivalence) methodology.
      </p>
    </div>
  );
}

import { getAccountsData } from "../lib/data";
import RankingTable from "../components/RankingTable";
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

      {/* Block 2: Search (UI placeholder for Phase 5) */}
      <section className="max-w-xl mx-auto w-full">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or @handle..."
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 pl-10 text-sm placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            disabled
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
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

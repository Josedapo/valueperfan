"use client";

import { useState } from "react";
import { Link } from "../i18n/navigation";
import type { Account } from "../lib/types";
import MiniRanking from "./MiniRanking";

interface NeighborsResult {
  above: Account[];
  below: Account[];
  currentRank: number;
}

interface RankingTab {
  id: string;
  label: string;
  title: string;
  linkHref: string;
  linkLabel: string;
  tvNeighbors: NeighborsResult;
  vpfNeighbors: NeighborsResult;
  account: Account;
}

export default function RankingTabs({ tabs }: { tabs: RankingTab[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");

  if (tabs.length === 0) return null;

  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-2 mb-4 overflow-x-auto -mx-4 px-4 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              tab.id === active.id
                ? "bg-primary text-primary-contrast"
                : "bg-surface-alt text-text-secondary hover:text-primary hover:bg-primary-light"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-muted">{active.title}</p>
        <Link
          href={active.linkHref}
          className="text-xs text-primary hover:text-primary-dark transition-colors"
        >
          {active.linkLabel}
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <MiniRanking
          above={active.tvNeighbors.above}
          current={active.account}
          below={active.tvNeighbors.below}
          metric="totalValue"
          startRank={active.tvNeighbors.currentRank - active.tvNeighbors.above.length}
        />
        <MiniRanking
          above={active.vpfNeighbors.above}
          current={active.account}
          below={active.vpfNeighbors.below}
          metric="vpf"
          startRank={active.vpfNeighbors.currentRank - active.vpfNeighbors.above.length}
        />
      </div>
    </div>
  );
}

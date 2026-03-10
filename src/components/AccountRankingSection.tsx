import { Link } from "../i18n/navigation";
import { countryCodeToFlag } from "../lib/utils";
import type { Account } from "../lib/types";
import MiniRanking from "./MiniRanking";

interface NeighborsResult {
  above: Account[];
  below: Account[];
  currentRank: number;
}

export default function AccountRankingSection({
  title,
  linkHref,
  linkLabel,
  tvNeighbors,
  vpfNeighbors,
  account,
  titleTag: TitleTag = "h3",
  titleClassName = "text-xs font-bold text-text-secondary uppercase tracking-wider",
  flag,
}: {
  title: string;
  linkHref: string;
  linkLabel: string;
  tvNeighbors: NeighborsResult;
  vpfNeighbors: NeighborsResult;
  account: Account;
  titleTag?: "h2" | "h3";
  titleClassName?: string;
  flag?: string | null;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <TitleTag className={titleClassName}>
          {flag && <>{flag} </>}
          {title}
        </TitleTag>
        <Link href={linkHref} className="text-xs text-primary hover:text-primary-dark transition-colors">
          {linkLabel}
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <MiniRanking
          above={tvNeighbors.above}
          current={account}
          below={tvNeighbors.below}
          metric="totalValue"
          startRank={tvNeighbors.currentRank - tvNeighbors.above.length}
        />
        <MiniRanking
          above={vpfNeighbors.above}
          current={account}
          below={vpfNeighbors.below}
          metric="vpf"
          startRank={vpfNeighbors.currentRank - vpfNeighbors.above.length}
        />
      </div>
    </div>
  );
}

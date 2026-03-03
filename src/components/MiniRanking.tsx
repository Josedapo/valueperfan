import Link from "next/link";
import type { Account } from "../lib/types";
import { formatVPF } from "../lib/utils";
import AccountAvatar from "./AccountAvatar";

export default function MiniRanking({
  above,
  current,
  below,
}: {
  above: Account[];
  current: Account;
  below: Account[];
}) {
  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="px-4 py-3 bg-surface-alt border-b border-border">
        <h3 className="text-sm font-semibold text-text">
          Ranking Neighbors (Value Per Fan)
        </h3>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {above.map((account) => (
            <RankingRow key={`${account.platform}-${account.handle}`} account={account} />
          ))}
          <RankingRow account={current} isCurrent />
          {below.map((account) => (
            <RankingRow key={`${account.platform}-${account.handle}`} account={account} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RankingRow({
  account,
  isCurrent = false,
}: {
  account: Account;
  isCurrent?: boolean;
}) {
  const row = (
    <tr
      className={`border-b border-border last:border-0 ${
        isCurrent
          ? "bg-primary-light font-semibold"
          : "hover:bg-surface-alt transition-colors"
      }`}
    >
      <td className="px-4 py-2.5 font-mono text-text-muted w-12">
        #{account.rank.vpf}
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <AccountAvatar src={account.avatarUrl} name={account.name} size={28} />
          <div className="min-w-0">
            <p className="truncate text-sm">{account.name}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-2.5 text-right text-primary">
        {formatVPF(account.valuePerFan)}
      </td>
    </tr>
  );

  if (isCurrent) return row;

  return (
    <Link
      href={`/account/${account.platform}/${account.slug}`}
      className="contents"
    >
      {row}
    </Link>
  );
}

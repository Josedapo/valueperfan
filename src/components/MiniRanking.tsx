"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "../i18n/navigation";
import type { Account } from "../lib/types";
import type { Metric } from "../lib/platform";
import { formatVPF, formatCurrency } from "../lib/utils";
import AccountAvatar from "./AccountAvatar";

export default function MiniRanking({
  above,
  current,
  below,
  metric = "vpf",
  startRank,
}: {
  above: Account[];
  current: Account;
  below: Account[];
  metric?: Metric;
  startRank?: number;
}) {
  const t = useTranslations("account");
  const title =
    metric === "vpf" ? t("neighborhoodVpf") : t("neighborhoodTv");

  // If startRank is provided, use sequential numbering from that position.
  // Otherwise, use the pre-calculated global rank from each account.
  const allAccounts = [...above, current, ...below];

  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="px-4 py-3 bg-surface-alt border-b border-border">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
      </div>
      <table className="w-full table-fixed text-sm">
        <colgroup>
          <col className="w-14" />
          <col />
          <col className="w-32" />
        </colgroup>
        <tbody>
          {allAccounts.map((account, index) => {
            const rank = startRank
              ? startRank + index
              : metric === "vpf"
                ? account.rank.vpf
                : account.rank.totalValue;
            const isCurrent =
              account.handle === current.handle &&
              account.platform === current.platform;

            return (
              <RankingRow
                key={`${account.platform}-${account.handle}`}
                account={account}
                metric={metric}
                isCurrent={isCurrent}
                rank={rank}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RankingRow({
  account,
  isCurrent = false,
  metric,
  rank,
}: {
  account: Account;
  isCurrent?: boolean;
  metric: Metric;
  rank: number;
}) {
  const router = useRouter();
  const value =
    metric === "vpf"
      ? formatVPF(account.valuePerFan)
      : formatCurrency(account.totalValue);

  return (
    <tr
      onClick={
        isCurrent
          ? undefined
          : () =>
              router.push(
                `/account/${account.platform}/${account.slug}`
              )
      }
      className={`border-b border-border last:border-0 ${
        isCurrent
          ? "bg-primary-light font-semibold"
          : "hover:bg-surface-alt transition-colors cursor-pointer"
      }`}
    >
      <td className="px-4 py-2.5 font-mono text-text-muted w-12">
        #{rank}
      </td>
      <td className="px-4 py-2.5 overflow-hidden">
        <div className="flex items-center gap-2">
          <AccountAvatar
            src={account.avatarUrl}
            name={account.name}
            size={28}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{account.name}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-2.5 text-right text-primary">{value}</td>
    </tr>
  );
}

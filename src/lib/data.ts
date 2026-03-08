import accountsData from "../data/accounts.json";
import type { Account, AccountsData } from "./types";
import type { Platform, Metric } from "./platform";

export function getAccountsData(): AccountsData {
  return accountsData as AccountsData;
}

export function getAccountsByPlatform(platform: Platform): Account[] {
  const data = getAccountsData();
  return data.accounts.filter((a) => a.platform === platform);
}

export function getAccount(
  platform: string,
  handle: string
): Account | undefined {
  const data = getAccountsData();
  return data.accounts.find(
    (a) => a.platform === platform && a.slug === handle
  );
}

export function getAccountsByCategory(category: string): Account[] {
  const data = getAccountsData();
  return data.accounts.filter((a) => a.category === category);
}

export function getNeighbors(
  account: Account,
  count: number = 3,
  metric: Metric = "vpf"
): { above: Account[]; below: Account[] } {
  const platformAccounts = getAccountsByPlatform(account.platform);
  const sorted = [...platformAccounts].sort((a, b) =>
    metric === "vpf"
      ? a.rank.vpf - b.rank.vpf
      : a.rank.totalValue - b.rank.totalValue
  );
  const index = sorted.findIndex(
    (a) => a.handle === account.handle && a.platform === account.platform
  );

  const total = count * 2; // total neighbors (excluding current)
  let start = Math.max(0, index - count);
  let end = Math.min(sorted.length, index + count + 1);

  // If not enough above, extend below
  if (index < count) {
    end = Math.min(sorted.length, index + 1 + (total - index));
  }
  // If not enough below, extend above
  if (sorted.length - 1 - index < count) {
    start = Math.max(0, index - (total - (sorted.length - 1 - index)));
  }

  const above = sorted.slice(start, index);
  const below = sorted.slice(index + 1, end);

  return { above, below };
}

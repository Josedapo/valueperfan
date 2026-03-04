import accountsData from "../data/accounts.json";
import type { Account, AccountsData } from "./types";

export function getAccountsData(): AccountsData {
  return accountsData as AccountsData;
}

export function getAccountsByPlatform(
  platform: "instagram" | "tiktok"
): Account[] {
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
  metric: "vpf" | "totalValue" = "vpf"
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

  const above = sorted.slice(Math.max(0, index - count), index);
  const below = sorted.slice(index + 1, index + 1 + count);

  return { above, below };
}

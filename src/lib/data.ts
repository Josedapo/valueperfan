import accountsData from "../data/accounts.json";
import type { Account, AccountsData } from "./types";
import type { Platform, Metric } from "./platform";
import { mapCategory } from "./category-map";

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

export function getAccountsByCountryAndPlatform(
  country: string,
  platform: Platform
): Account[] {
  const data = getAccountsData();
  return data.accounts.filter(
    (a) => a.platform === platform && a.country === country
  );
}

export function getAccountsByCategoryAndPlatform(
  categoryName: string,
  platform: Platform
): Account[] {
  const data = getAccountsData();
  return data.accounts.filter(
    (a) => a.platform === platform && mapCategory(a.category) === categoryName
  );
}

export function getAccountsByCategoryCountryAndPlatform(
  categoryName: string,
  country: string,
  platform: Platform
): Account[] {
  const data = getAccountsData();
  return data.accounts.filter(
    (a) =>
      a.platform === platform &&
      mapCategory(a.category) === categoryName &&
      a.country === country
  );
}

export function getNeighbors(
  account: Account,
  count: number = 3,
  metric: Metric = "vpf",
  accountPool?: Account[]
): { above: Account[]; below: Account[]; currentRank: number } {
  const pool = accountPool ?? getAccountsByPlatform(account.platform);
  const sorted = [...pool].sort((a, b) =>
    metric === "vpf"
      ? b.valuePerFan - a.valuePerFan
      : b.totalValue - a.totalValue
  );
  const index = sorted.findIndex(
    (a) => a.handle === account.handle && a.platform === account.platform
  );

  if (index === -1) return { above: [], below: [], currentRank: 0 };

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

  return { above, below, currentRank: index + 1 };
}

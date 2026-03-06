import type { Platform } from "./platform";

export interface Account {
  handle: string;
  platform: Platform;
  name: string;
  avatarUrl: string;
  followers: number;
  posts: number;
  valuePerFan: number;
  totalValue: number;
  category: string;
  profileUrl: string;
  rank: {
    vpf: number;
    totalValue: number;
  };
  slug: string;
}

export interface AccountsData {
  meta: {
    lastUpdated: string;
    totalAccounts: number;
    platforms: Record<Platform, number>;
  };
  accounts: Account[];
}

export interface SearchEntry {
  handle: string;
  name: string;
  platform: Platform;
  slug: string;
  avatarUrl: string;
  category: string;
}

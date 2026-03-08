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
  impressions: number;
  engagement: number;
  engRate: number;
  category: string;
  profileUrl: string;
  country: string | null;
  countryCode: string | null;
  rank: {
    vpf: number;
    totalValue: number;
  };
  slug: string;
}

export interface AccountsData {
  meta: {
    lastUpdated: string;
    dataMonth: string;
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
  country: string | null;
}

export interface RankingHistory {
  months: string[];
  accounts: Record<string, Record<string, { vpf: number; totalValue: number }>>;
}

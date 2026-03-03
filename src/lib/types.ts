export interface Account {
  handle: string;
  platform: "instagram" | "tiktok";
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
    platforms: {
      instagram: number;
      tiktok: number;
    };
  };
  accounts: Account[];
}

export interface SearchEntry {
  handle: string;
  name: string;
  platform: "instagram" | "tiktok";
  slug: string;
  avatarUrl: string;
}

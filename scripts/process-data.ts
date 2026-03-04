import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface RawRow {
  handle: string;
  socialNetwork: string;
  profileName: string;
  avatarUrl: string;
  followers: string;
  posts: string;
  valuePerFan: string;
  totalValue: string;
  category: string;
  url: string;
}

const DEFAULT_AVATAR = "/images/default-avatar.svg";

function parseCSV(content: string): RawRow[] {
  const lines = content.trim().split("\n");
  const rows: RawRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length < 10) continue;

    rows.push({
      handle: fields[0].trim(),
      socialNetwork: fields[1].trim().toLowerCase(),
      profileName: fields[2].trim(),
      avatarUrl: fields[3].trim(),
      followers: fields[4].trim(),
      posts: fields[5].trim(),
      valuePerFan: fields[6].trim(),
      totalValue: fields[7].trim(),
      category: fields[8].trim(),
      url: fields[9].trim(),
    });
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);

  return fields;
}

function main() {
  const rawPath = join(__dirname, "raw-data.csv");
  const content = readFileSync(rawPath, "utf-8");
  const rawRows = parseCSV(content);

  console.log(`Raw rows parsed: ${rawRows.length}`);

  // Track stats
  let removedZeroValue = 0;
  let removedMissingCritical = 0;
  let removedDuplicates = 0;
  let avatarFallbacks = 0;

  // Filter: remove rows with missing critical fields
  const withCritical = rawRows.filter((row) => {
    const hasCritical =
      row.handle &&
      row.socialNetwork &&
      row.profileName &&
      row.followers &&
      row.valuePerFan &&
      row.totalValue;
    if (!hasCritical) removedMissingCritical++;
    return hasCritical;
  });

  // Filter: remove rows with zero VPF or zero Total Value
  const withValue = withCritical.filter((row) => {
    const vpf = parseFloat(row.valuePerFan);
    const tv = parseFloat(row.totalValue);
    const hasValue = vpf > 0 && tv > 0;
    if (!hasValue) removedZeroValue++;
    return hasValue;
  });

  // Filter: remove duplicates (same handle + platform, keep first)
  const seen = new Set<string>();
  const unique = withValue.filter((row) => {
    const key = `${row.handle.toLowerCase()}_${row.socialNetwork}`;
    if (seen.has(key)) {
      removedDuplicates++;
      return false;
    }
    seen.add(key);
    return true;
  });

  // Validate platform
  const validPlatforms = unique.filter(
    (row) => row.socialNetwork === "instagram" || row.socialNetwork === "tiktok"
  );

  // Transform to account objects
  const accounts = validPlatforms.map((row) => {
    const hasAvatar = row.avatarUrl && row.avatarUrl.startsWith("http");
    if (!hasAvatar) avatarFallbacks++;

    return {
      handle: row.handle.toLowerCase(),
      platform: row.socialNetwork as "instagram" | "tiktok",
      name: row.profileName,
      avatarUrl: hasAvatar ? row.avatarUrl : DEFAULT_AVATAR,
      followers: parseInt(row.followers, 10) || 0,
      posts: parseInt(row.posts, 10) || 0,
      valuePerFan: parseFloat(row.valuePerFan) || 0,
      totalValue: parseFloat(row.totalValue) || 0,
      category: row.category || "Uncategorized",
      profileUrl: row.url || "",
      rank: { vpf: 0, totalValue: 0 },
      slug: row.handle.toLowerCase(),
    };
  });

  // Calculate rankings per platform
  const platforms = ["instagram", "tiktok"] as const;

  for (const platform of platforms) {
    const platformAccounts = accounts.filter((a) => a.platform === platform);

    // Rank by VPF (descending)
    const byVpf = [...platformAccounts].sort(
      (a, b) => b.valuePerFan - a.valuePerFan
    );
    byVpf.forEach((account, index) => {
      account.rank.vpf = index + 1;
    });

    // Rank by Total Value (descending)
    const byTotalValue = [...platformAccounts].sort(
      (a, b) => b.totalValue - a.totalValue
    );
    byTotalValue.forEach((account, index) => {
      account.rank.totalValue = index + 1;
    });
  }

  // Build output
  const igCount = accounts.filter((a) => a.platform === "instagram").length;
  const tkCount = accounts.filter((a) => a.platform === "tiktok").length;

  const output = {
    meta: {
      lastUpdated: new Date().toISOString().split("T")[0],
      totalAccounts: accounts.length,
      platforms: {
        instagram: igCount,
        tiktok: tkCount,
      },
    },
    accounts,
  };

  // Build search index (lightweight)
  const searchIndex = accounts.map((a) => ({
    handle: a.handle,
    name: a.name,
    platform: a.platform,
    slug: a.slug,
    avatarUrl: a.avatarUrl,
    category: a.category,
  }));

  // Write output files
  const dataDir = join(__dirname, "..", "src", "data");
  writeFileSync(
    join(dataDir, "accounts.json"),
    JSON.stringify(output, null, 2),
    "utf-8"
  );
  writeFileSync(
    join(dataDir, "search-index.json"),
    JSON.stringify(searchIndex),
    "utf-8"
  );

  // Report
  console.log("\n--- Processing Report ---");
  console.log(`Removed (missing critical fields): ${removedMissingCritical}`);
  console.log(`Removed (zero VPF or Total Value): ${removedZeroValue}`);
  console.log(`Removed (duplicates): ${removedDuplicates}`);
  console.log(`Avatar fallbacks applied: ${avatarFallbacks}`);
  console.log(`\nFinal accounts: ${accounts.length}`);
  console.log(`  Instagram: ${igCount}`);
  console.log(`  TikTok: ${tkCount}`);
  console.log(
    `\nFiles written:`
  );
  console.log(`  src/data/accounts.json (${(JSON.stringify(output).length / 1024).toFixed(0)} KB)`);
  console.log(`  src/data/search-index.json (${(JSON.stringify(searchIndex).length / 1024).toFixed(0)} KB)`);
}

main();

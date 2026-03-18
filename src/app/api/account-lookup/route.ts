import { NextResponse } from "next/server";
import { getAccountsData, getEngagementRateBenchmark } from "../../../lib/data";
import { mapCategory } from "../../../lib/category-map";
import { formatCurrency, formatVPF, formatFollowers } from "../../../lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle")?.toLowerCase().replace(/^@/, "");

  if (!handle) {
    return NextResponse.json(null, { status: 400 });
  }

  const data = getAccountsData();
  const matches = data.accounts.filter(
    (a) => a.handle.toLowerCase() === handle || a.slug === handle
  );

  if (matches.length === 0) {
    return NextResponse.json(null, { status: 404 });
  }

  const results = matches.map((a) => {
    const mappedCategory = mapCategory(a.category);
    const benchmark = getEngagementRateBenchmark(mappedCategory, a.platform, a.engRate);
    return {
      handle: a.handle,
      name: a.name,
      platform: a.platform,
      slug: a.slug,
      avatarUrl: a.avatarUrl,
      followers: a.followers,
      followersFormatted: formatFollowers(a.followers),
      totalValue: a.totalValue,
      totalValueFormatted: formatCurrency(a.totalValue),
      valuePerFan: a.valuePerFan,
      vpfFormatted: formatVPF(a.valuePerFan),
      engRate: a.engRate,
      engRateFormatted: (a.engRate * 100).toFixed(2) + "%",
      category: mappedCategory,
      country: a.country,
      rank: a.rank,
      benchmark: benchmark
        ? {
            median: benchmark.median,
            medianFormatted: (benchmark.median * 100).toFixed(2) + "%",
            percentile: benchmark.percentile,
            count: benchmark.count,
          }
        : null,
    };
  });

  return NextResponse.json(results, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}

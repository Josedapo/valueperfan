import { NextRequest, NextResponse } from "next/server";
import { getAccountsData } from "../../../lib/data";
import type { Platform, Metric } from "../../../lib/platform";
import { ITEMS_PER_PAGE } from "../../../lib/config";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const platform = (searchParams.get("platform") || "instagram") as Platform;
  const metric = (searchParams.get("metric") || "totalValue") as Metric;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  // Validate params
  if (!["instagram", "tiktok"].includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }
  if (!["vpf", "totalValue"].includes(metric)) {
    return NextResponse.json({ error: "Invalid metric" }, { status: 400 });
  }

  const data = getAccountsData();
  const filtered = data.accounts.filter((a) => a.platform === platform);
  const sorted = [...filtered].sort((a, b) => {
    if (metric === "vpf") return a.rank.vpf - b.rank.vpf;
    return a.rank.totalValue - b.rank.totalValue;
  });

  const totalCount = sorted.length;
  const start = (page - 1) * ITEMS_PER_PAGE;
  const accounts = sorted.slice(start, start + ITEMS_PER_PAGE);

  return NextResponse.json(
    { accounts, totalCount },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    }
  );
}

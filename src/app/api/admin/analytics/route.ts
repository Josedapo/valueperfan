import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/config";
import { fetchAnalytics } from "@/lib/ga4";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (key !== env.analyticsSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = parseInt(
    request.nextUrl.searchParams.get("period") || "28",
    10,
  );
  const validPeriods = [7, 28, 90];
  const days = validPeriods.includes(period) ? period : 28;

  try {
    const data = await fetchAnalytics(days);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}

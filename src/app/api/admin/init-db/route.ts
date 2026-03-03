import { NextRequest, NextResponse } from "next/server";
import { initDb } from "../../../../lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  const secret = process.env.CLAIM_SECRET;

  if (!key || !secret || key !== secret) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  await initDb();

  return NextResponse.json({ ok: true, message: "Database initialized" });
}

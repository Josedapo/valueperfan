import { NextRequest, NextResponse } from "next/server";
import { initDb } from "../../../../lib/db";
import { env } from "../../../../lib/config";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");

  if (!key || key !== env.claimSecret) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  await initDb();

  return NextResponse.json({ ok: true, message: "Database initialized" });
}

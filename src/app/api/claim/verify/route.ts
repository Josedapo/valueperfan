import { NextRequest, NextResponse } from "next/server";
import { query, type ClaimRow } from "../../../../lib/db";
import { getSetCookieHeader } from "../../../../lib/cookies";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const rows = (await query(
    "SELECT id, platform, handle, email, status FROM claims WHERE token = $1",
    [token]
  )) as Pick<ClaimRow, "id" | "platform" | "handle" | "email" | "status">[];

  if (rows.length === 0) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const claim = rows[0];

  // If pending_email, advance to pending_bio
  if (claim.status === "pending_email") {
    await query(
      "UPDATE claims SET status = 'pending_bio', email_verified_at = CURRENT_TIMESTAMP WHERE id = $1",
      [claim.id]
    );
  }

  const accountUrl = `/account/${claim.platform}/${claim.handle}`;
  const response = NextResponse.redirect(new URL(accountUrl, request.url));
  response.headers.set("Set-Cookie", getSetCookieHeader(claim.email));

  return response;
}

import { NextRequest, NextResponse } from "next/server";
import { query, type ClaimRow } from "../../../../lib/db";
import { verifyCookie } from "../../../../lib/cookies";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const platform = request.nextUrl.searchParams.get("platform");
  const handle = request.nextUrl.searchParams.get("handle");

  if (!platform || !handle) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const rows = (await query(
    "SELECT email, bio_code, status FROM claims WHERE platform = $1 AND handle = $2",
    [platform, handle]
  )) as Pick<ClaimRow, "email" | "bio_code" | "status">[];

  if (rows.length === 0) {
    return NextResponse.json({ status: "unclaimed", isOwner: false });
  }

  const claim = rows[0];

  // Check if current user is the owner
  let isOwner = false;
  const cookieValue = request.cookies.get("vpf_session")?.value;
  if (cookieValue) {
    const email = verifyCookie(cookieValue);
    if (email && email === claim.email) {
      isOwner = true;
    }
  }

  // Map DB status to client status
  let clientStatus: string;
  if (claim.status === "verified") {
    clientStatus = "claimed";
  } else if (isOwner) {
    clientStatus = claim.status; // pending_bio or pending_review
  } else {
    // Non-owner sees unclaimed for pending states
    clientStatus = "unclaimed";
  }

  const response: Record<string, unknown> = {
    status: clientStatus,
    isOwner,
  };

  // Only share bio code with the owner when they need it
  if (isOwner && claim.status === "pending_bio") {
    response.bioCode = claim.bio_code;
  }

  return NextResponse.json(response);
}

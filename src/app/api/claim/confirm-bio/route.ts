import { NextRequest, NextResponse } from "next/server";
import { query, type ClaimRow } from "../../../../lib/db";
import { verifyCookie } from "../../../../lib/cookies";
import { getAccount } from "../../../../lib/data";
import { sendReviewNotification } from "../../../../lib/email";
import type { Platform } from "../../../../lib/platform";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: { platform?: Platform; handle?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { platform, handle } = body;
  if (!platform || !handle) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  // Verify cookie
  const cookieValue = request.cookies.get("vpf_session")?.value;
  if (!cookieValue) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const email = verifyCookie(cookieValue);
  if (!email) {
    return NextResponse.json({ error: "invalid_session" }, { status: 401 });
  }

  // Find claim and verify ownership
  const rows = (await query(
    "SELECT id, email, bio_code, status FROM claims WHERE platform = $1 AND handle = $2",
    [platform, handle]
  )) as Pick<ClaimRow, "id" | "email" | "bio_code" | "status">[];

  if (rows.length === 0) {
    return NextResponse.json({ error: "no_claim" }, { status: 404 });
  }

  const claim = rows[0];

  if (claim.email !== email) {
    return NextResponse.json({ error: "not_owner" }, { status: 403 });
  }

  if (claim.status !== "pending_bio") {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  // Update status
  await query(
    "UPDATE claims SET status = 'pending_review', review_requested_at = CURRENT_TIMESTAMP WHERE id = $1",
    [claim.id]
  );

  // Get account info for notification
  const account = getAccount(platform, handle);
  if (!account) {
    return NextResponse.json({ error: "account_not_found" }, { status: 404 });
  }

  // Send notification to admin
  try {
    await sendReviewNotification({
      platform,
      handle,
      accountName: account.name,
      claimantEmail: email,
      bioCode: claim.bio_code,
      claimId: Number(claim.id),
      profileUrl: account.profileUrl,
    });
  } catch (err) {
    console.error("Failed to send review notification:", err);
    return NextResponse.json(
      { ok: true, warning: "Claim submitted but notification failed" }
    );
  }

  return NextResponse.json({ ok: true });
}

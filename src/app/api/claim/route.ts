import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { query, type ClaimRow } from "../../../lib/db";
import { getAccount } from "../../../lib/data";
import { sendVerificationEmail } from "../../../lib/email";
import { isValidEmail } from "../../../lib/utils";
import type { Platform } from "../../../lib/platform";

export const runtime = "nodejs";

function generateBioCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion
  let code = "VPF-";
  const bytes = randomBytes(4);
  for (let i = 0; i < 4; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

export async function POST(request: NextRequest) {
  let body: { platform?: Platform; handle?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { platform, handle, email } = body;

  if (!platform || !handle || !email) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const account = getAccount(platform, handle);
  if (!account) {
    return NextResponse.json({ error: "account_not_found" }, { status: 404 });
  }

  // Check if already claimed (verified)
  const existing = (await query(
    "SELECT status FROM claims WHERE platform = $1 AND handle = $2",
    [platform, handle]
  )) as Pick<ClaimRow, "status">[];
  if (existing.length > 0 && existing[0].status === "verified") {
    return NextResponse.json({ error: "already_claimed" }, { status: 409 });
  }

  const token = randomBytes(32).toString("hex");
  const bioCode = generateBioCode();

  // Insert or replace (only if not verified)
  await query(
    `INSERT INTO claims (platform, handle, email, token, bio_code, status)
     VALUES ($1, $2, $3, $4, $5, 'pending_email')
     ON CONFLICT (platform, handle) DO UPDATE
     SET email = $3, token = $4, bio_code = $5, status = 'pending_email',
         created_at = CURRENT_TIMESTAMP, email_verified_at = NULL,
         review_requested_at = NULL, verified_at = NULL
     WHERE claims.status != 'verified'`,
    [platform, handle, email, token, bioCode]
  );

  await sendVerificationEmail({
    to: email,
    platform,
    handle,
    accountName: account.name,
    token,
    bioCode,
  });

  return NextResponse.json({ ok: true });
}

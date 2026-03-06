import { NextRequest, NextResponse } from "next/server";
import { query, type ClaimRow } from "../../../../lib/db";
import { sendApprovalEmail } from "../../../../lib/email";
import { getAccount } from "../../../../lib/data";
import { validateAdminRequest, htmlResponse } from "../../../../lib/admin-utils";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const result = validateAdminRequest(request, "approve");
  if (result instanceof NextResponse) return result;
  const { id } = result;

  const rows = (await query(
    "SELECT platform, handle, email, status FROM claims WHERE id = $1",
    [id]
  )) as Pick<ClaimRow, "platform" | "handle" | "email" | "status">[];

  if (rows.length === 0) {
    return htmlResponse("Claim Not Found", "This claim does not exist.");
  }

  const claim = rows[0];

  if (claim.status === "verified") {
    return htmlResponse(
      "Already Approved",
      `Claim for @${claim.handle} was already approved.`
    );
  }

  await query(
    "UPDATE claims SET status = 'verified', verified_at = CURRENT_TIMESTAMP WHERE id = $1",
    [id]
  );

  const account = getAccount(claim.platform, claim.handle);
  sendApprovalEmail({
    to: claim.email,
    platform: claim.platform,
    handle: claim.handle,
    accountName: account?.name ?? claim.handle,
  }).catch(console.error);

  return htmlResponse(
    "Claim Approved",
    `Claim for <strong>${account?.name ?? claim.handle}</strong> (@${claim.handle}) has been approved. The claimant (${claim.email}) has been notified.`
  );
}

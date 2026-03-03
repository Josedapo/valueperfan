import { NextRequest, NextResponse } from "next/server";
import { query, type ClaimRow } from "../../../../lib/db";
import { verifyAdminSignature } from "../../../../lib/cookies";
import { sendApprovalEmail } from "../../../../lib/email";
import { getAccount } from "../../../../lib/data";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const idStr = request.nextUrl.searchParams.get("id");
  const sig = request.nextUrl.searchParams.get("sig");

  if (!idStr || !sig) {
    return new NextResponse("Missing parameters", { status: 400 });
  }

  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    return new NextResponse("Invalid ID", { status: 400 });
  }

  if (!verifyAdminSignature("approve", id, sig)) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

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

  // Send approval email (don't block)
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

function htmlResponse(title: string, message: string): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html>
    <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title>
    <style>body{font-family:system-ui,sans-serif;max-width:480px;margin:60px auto;padding:0 20px;color:#1f2937;}
    h1{color:#059669;}</style></head>
    <body><h1>${title}</h1><p>${message}</p></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

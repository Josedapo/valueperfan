import { NextRequest, NextResponse } from "next/server";
import { query, type ClaimRow } from "../../../../lib/db";
import { verifyAdminSignature } from "../../../../lib/cookies";

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

  if (!verifyAdminSignature("reject", id, sig)) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const rows = (await query(
    "SELECT platform, handle, status FROM claims WHERE id = $1",
    [id]
  )) as Pick<ClaimRow, "platform" | "handle" | "status">[];

  if (rows.length === 0) {
    return htmlResponse("Claim Not Found", "This claim does not exist.");
  }

  const claim = rows[0];

  if (claim.status === "verified") {
    return htmlResponse(
      "Cannot Reject",
      `Claim for @${claim.handle} is already verified and cannot be rejected.`
    );
  }

  // Delete the claim so someone else can try
  await query("DELETE FROM claims WHERE id = $1", [id]);

  return htmlResponse(
    "Claim Rejected",
    `Claim for @${claim.handle} has been rejected and deleted. The account is now available for a new claim.`
  );
}

function htmlResponse(title: string, message: string): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html>
    <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title>
    <style>body{font-family:system-ui,sans-serif;max-width:480px;margin:60px auto;padding:0 20px;color:#1f2937;}
    h1{color:#dc2626;}</style></head>
    <body><h1>${title}</h1><p>${message}</p></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

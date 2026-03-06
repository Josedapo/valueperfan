import { NextRequest, NextResponse } from "next/server";
import { query, type ClaimRow } from "../../../../lib/db";
import { validateAdminRequest, htmlResponse } from "../../../../lib/admin-utils";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const result = validateAdminRequest(request, "reject");
  if (result instanceof NextResponse) return result;
  const { id } = result;

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
      `Claim for @${claim.handle} is already verified and cannot be rejected.`,
      "#dc2626"
    );
  }

  await query("DELETE FROM claims WHERE id = $1", [id]);

  return htmlResponse(
    "Claim Rejected",
    `Claim for @${claim.handle} has been rejected and deleted. The account is now available for a new claim.`,
    "#dc2626"
  );
}

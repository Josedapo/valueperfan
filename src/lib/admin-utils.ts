import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSignature } from "./cookies";

export function htmlResponse(
  title: string,
  message: string,
  color: string = "#059669"
): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html>
    <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title>
    <style>body{font-family:system-ui,sans-serif;max-width:480px;margin:60px auto;padding:0 20px;color:#1f2937;}
    h1{color:${color};}</style></head>
    <body><h1>${title}</h1><p>${message}</p></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export function validateAdminRequest(
  request: NextRequest,
  action: string
): { id: number } | NextResponse {
  const idStr = request.nextUrl.searchParams.get("id");
  const sig = request.nextUrl.searchParams.get("sig");

  if (!idStr || !sig) {
    return new NextResponse("Missing parameters", { status: 400 });
  }

  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    return new NextResponse("Invalid ID", { status: 400 });
  }

  if (!verifyAdminSignature(action, id, sig)) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  return { id };
}

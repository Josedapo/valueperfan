import { NextRequest, NextResponse } from "next/server";
import { sendSuggestionEmail } from "../../../lib/email";
import type { Platform } from "../../../lib/platform";

interface SuggestRequest {
  handle: string;
  platform: Platform;
  email: string;
}

export async function POST(request: NextRequest) {
  let body: Partial<SuggestRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { handle, platform, email } = body;

  if (!handle || !platform || !email) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  try {
    await sendSuggestionEmail({
      handle,
      platform,
      requesterEmail: email,
    });
  } catch (error) {
    console.error("Failed to send suggestion email:", error);
    return NextResponse.json({ error: "email_failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

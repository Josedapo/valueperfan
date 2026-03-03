import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { handle, platform, email } = body;

  // For the prototype, just log the suggestion
  // In production, this would store in a database or send an email
  console.log("Account suggestion received:", { handle, platform, email });

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { env, EMAIL_FROM } from "../../../lib/config";

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const resend = new Resend(env.resendApiKey);
    await resend.emails.send({
      from: EMAIL_FROM,
      to: env.notificationEmail,
      replyTo: email,
      subject: `[VPF Contact] ${subject}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #059669;">New Contact Message</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 4px 0; color: #6b7280;">Name</td><td style="padding: 4px 0;"><strong>${name}</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Email</td><td style="padding: 4px 0;">${email}</td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Subject</td><td style="padding: 4px 0;">${subject}</td></tr>
          </table>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-top: 16px;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">ValuePerFan — Contact form submission</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

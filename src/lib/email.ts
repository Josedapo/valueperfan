import { Resend } from "resend";
import { adminSignature } from "./cookies";

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

const BASE_URL = "https://valueperfan.com";
const FROM = "ValuePerFan <noreply@valueperfan.com>";

export async function sendVerificationEmail({
  to,
  platform,
  handle,
  accountName,
  token,
  bioCode,
}: {
  to: string;
  platform: string;
  handle: string;
  accountName: string;
  token: string;
  bioCode: string;
}) {
  const verifyUrl = `${BASE_URL}/api/claim/verify?token=${token}`;
  const platformLabel = platform === "instagram" ? "Instagram" : "TikTok";

  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Verify your claim for ${accountName} on ValuePerFan`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #059669;">ValuePerFan</h2>
        <p>You requested to claim <strong>${accountName}</strong> (@${handle}) on ${platformLabel}.</p>

        <h3>Step 1: Verify your email</h3>
        <p>
          <a href="${verifyUrl}"
             style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Verify Email
          </a>
        </p>

        <h3>Step 2: Prove you own the account</h3>
        <p>After verifying your email, add this code to your ${platformLabel} bio:</p>
        <p style="background: #f3f4f6; padding: 12px 16px; border-radius: 8px; font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 1px;">
          ${bioCode}
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          You can remove the code from your bio after your claim is approved.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendReviewNotification({
  platform,
  handle,
  accountName,
  claimantEmail,
  bioCode,
  claimId,
  profileUrl,
}: {
  platform: string;
  handle: string;
  accountName: string;
  claimantEmail: string;
  bioCode: string;
  claimId: number;
  profileUrl: string;
}) {
  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  if (!notificationEmail) throw new Error("NOTIFICATION_EMAIL is not set");

  const approveSig = adminSignature("approve", claimId);
  const rejectSig = adminSignature("reject", claimId);
  const approveUrl = `${BASE_URL}/api/admin/approve?id=${claimId}&sig=${approveSig}`;
  const rejectUrl = `${BASE_URL}/api/admin/reject?id=${claimId}&sig=${rejectSig}`;
  const platformLabel = platform === "instagram" ? "Instagram" : "TikTok";

  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to: notificationEmail,
    subject: `Claim review: ${accountName} (@${handle}) on ${platformLabel}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #059669;">New Claim to Review</h2>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 4px 0; color: #6b7280;">Account</td><td style="padding: 4px 0;"><strong>${accountName}</strong> (@${handle})</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Platform</td><td style="padding: 4px 0;">${platformLabel}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Claimant email</td><td style="padding: 4px 0;">${claimantEmail}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Code to find</td><td style="padding: 4px 0; font-family: monospace; font-weight: bold; font-size: 16px;">${bioCode}</td></tr>
        </table>

        <h3>1. Check the profile</h3>
        <p>
          <a href="${profileUrl}" style="color: #059669; font-weight: 600;">
            Open ${platformLabel} profile →
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">Look for <strong>${bioCode}</strong> in the bio.</p>

        <h3>2. Approve or reject</h3>
        <p style="display: flex; gap: 12px;">
          <a href="${approveUrl}"
             style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Approve
          </a>
          <a href="${rejectUrl}"
             style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Reject
          </a>
        </p>
      </div>
    `,
  });
}

export async function sendSuggestionEmail({
  handle,
  platform,
  requesterEmail,
}: {
  handle: string;
  platform: string;
  requesterEmail: string;
}) {
  const platformLabel = platform === "instagram" ? "Instagram" : "TikTok";

  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to: "jodapogo@gmail.com",
    subject: `New account suggestion: @${handle} on ${platformLabel}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #059669;">New Account Suggestion</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 4px 0; color: #6b7280;">Handle</td><td style="padding: 4px 0;"><strong>@${handle}</strong></td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Platform</td><td style="padding: 4px 0;">${platformLabel}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Requested by</td><td style="padding: 4px 0;">${requesterEmail}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">ValuePerFan — Account suggestion notification</p>
      </div>
    `,
  });
}

export async function sendApprovalEmail({
  to,
  platform,
  handle,
  accountName,
}: {
  to: string;
  platform: string;
  handle: string;
  accountName: string;
}) {
  const accountUrl = `${BASE_URL}/account/${platform}/${handle}`;
  const platformLabel = platform === "instagram" ? "Instagram" : "TikTok";

  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your claim for ${accountName} has been approved!`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #059669;">Claim Approved!</h2>
        <p>Your claim for <strong>${accountName}</strong> (@${handle}) on ${platformLabel} has been verified.</p>

        <p>You can now access your embeddable badge:</p>
        <p>
          <a href="${accountUrl}"
             style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Go to your page
          </a>
        </p>

        <p style="color: #6b7280; font-size: 14px;">
          You can now remove the verification code from your ${platformLabel} bio if you haven't already.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">ValuePerFan — The real value of social media followers</p>
      </div>
    `,
  });
}

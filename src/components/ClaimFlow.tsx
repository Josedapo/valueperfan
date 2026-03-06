"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { platformLabel, type Platform } from "../lib/platform";

interface ClaimFlowProps {
  platform: Platform;
  handle: string;
  slug: string;
  name: string;
  vpf: string;
  rankVpf: number;
}

type FlowState =
  | "loading"
  | "unclaimed"
  | "email_form"
  | "email_sent"
  | "pending_bio"
  | "pending_review"
  | "claimed_by_other"
  | "owned";

export default function ClaimFlow({
  platform,
  handle,
  slug,
  name,
  vpf,
  rankVpf,
}: ClaimFlowProps) {
  const t = useTranslations("claim");
  const [state, setState] = useState<FlowState>("loading");
  const [email, setEmail] = useState("");
  const [bioCode, setBioCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<"bio" | "embed" | null>(null);

  const pLabel = platformLabel(platform);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/claim/status?platform=${platform}&handle=${slug}`
      );
      const data = await res.json();

      if (data.status === "unclaimed") {
        setState("unclaimed");
      } else if (data.status === "claimed") {
        setState(data.isOwner ? "owned" : "claimed_by_other");
      } else if (data.status === "pending_bio" && data.isOwner) {
        setBioCode(data.bioCode);
        setState("pending_bio");
      } else if (data.status === "pending_review" && data.isOwner) {
        setState("pending_review");
      } else {
        setState("unclaimed");
      }
    } catch {
      setState("unclaimed");
    }
  }, [platform, slug]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  async function handleSubmitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, handle: slug, email }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "already_claimed") {
          setState("claimed_by_other");
          return;
        }
        setError(
          data.error === "invalid_email"
            ? t("invalidEmail")
            : t("genericError")
        );
        return;
      }

      setState("email_sent");
    } catch {
      setError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmBio() {
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/claim/confirm-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, handle: slug }),
      });

      if (!res.ok) {
        setError(t("genericError"));
        return;
      }

      setState("pending_review");
    } catch {
      setError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  function copyToClipboard(text: string, type: "bio" | "embed") {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const embedCode = `<a href="https://valueperfan.com/account/${platform}/${slug}?ref=badge">\n  <img src="https://valueperfan.com/api/badge/${platform}/${slug}" alt="ValuePerFan badge" />\n</a>`;

  // Badge pill — always visible
  const badgePill = (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface px-3 py-1.5 text-sm">
      <span className="font-bold text-primary">VPF</span>
      <span className="text-text font-medium">{vpf}/1K</span>
      <span className="text-text-muted">#{rankVpf}</span>
    </div>
  );

  // Star icon
  const starIcon = (
    <svg
      className="w-5 h-5 text-primary shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );

  return (
    <div className="rounded-lg border-2 border-primary/30 bg-primary-light p-4">
      {/* Header row — always shown */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          {starIcon}
          <h3 className="text-sm font-semibold text-primary">
            {t("badgeTitle")}
          </h3>
        </div>
        {badgePill}
      </div>

      {/* State-specific content */}
      {state === "loading" && (
        <p className="text-xs text-primary-dark">{t("checking")}</p>
      )}

      {state === "unclaimed" && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-primary-dark font-medium">
            {t("claimCta")}
          </p>
          <button
            onClick={() => setState("email_form")}
            className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            {t("claimButton")}
          </button>
        </div>
      )}

      {state === "email_form" && (
        <form onSubmit={handleSubmitEmail} className="space-y-3">
          <p className="text-xs text-primary-dark font-medium">
            {t("emailPrompt", { name })}
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="flex-1 rounded-lg border border-primary/30 bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={submitting}
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {submitting ? t("sending") : t("sendVerification")}
            </button>
            <button
              type="button"
              onClick={() => {
                setState("unclaimed");
                setError("");
              }}
              className="shrink-0 rounded-lg border border-primary/30 px-3 py-2 text-xs font-medium text-primary-dark hover:bg-primary/10 transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </form>
      )}

      {state === "email_sent" && (
        <div className="space-y-1">
          <p className="text-xs text-primary-dark font-semibold">
            {t("checkInbox")}
          </p>
          <p className="text-xs text-primary-dark">
            {t.rich("emailSentMessage", {
              email,
              bold: (chunks) => <span className="font-medium">{chunks}</span>,
            })}
          </p>
        </div>
      )}

      {state === "pending_bio" && (
        <div className="space-y-3">
          <p className="text-xs text-primary-dark font-medium">
            {t("bioPrompt", { platform: pLabel })}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-surface border border-primary/20 px-4 py-2.5 text-base font-bold font-mono tracking-wider text-primary text-center">
              {bioCode}
            </code>
            <button
              onClick={() => copyToClipboard(bioCode, "bio")}
              className="shrink-0 rounded-lg border border-primary/30 px-3 py-2.5 text-xs font-medium text-primary-dark hover:bg-primary/10 transition-colors"
            >
              {copied === "bio" ? t("copied") : t("copy")}
            </button>
          </div>
          <p className="text-xs text-text-muted">{t("bioRemovalNote")}</p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmBio}
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {submitting ? t("submitting") : t("bioAdded")}
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}

      {state === "pending_review" && (
        <div className="space-y-1">
          <p className="text-xs text-primary-dark font-semibold">
            {t("pendingReviewTitle")}
          </p>
          <p className="text-xs text-primary-dark">
            {t("pendingReviewMessage", { platform: pLabel })}
          </p>
        </div>
      )}

      {state === "claimed_by_other" && (
        <p className="text-xs text-primary-dark font-medium">
          {t("claimedByOther")}
        </p>
      )}

      {state === "owned" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-primary shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            <p className="text-xs text-primary-dark font-semibold">
              {t("youOwnThis")}
            </p>
          </div>
          <p className="text-xs text-primary-dark font-medium">
            {t("addBadge")}
          </p>
          <div className="relative">
            <pre className="rounded-lg bg-surface border border-primary/20 px-4 py-3 text-xs font-mono text-text overflow-x-auto whitespace-pre-wrap break-all">
              {embedCode}
            </pre>
          </div>
          <button
            onClick={() => copyToClipboard(embedCode, "embed")}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            {copied === "embed" ? t("copied") : t("copyEmbed")}
          </button>
        </div>
      )}
    </div>
  );
}

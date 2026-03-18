"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { platformLabel, type Platform } from "../lib/platform";

interface ClaimFlowProps {
  platform: Platform;
  handle: string;
  slug: string;
  name: string;
  compact?: boolean;
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
  compact = false,
}: ClaimFlowProps) {
  const t = useTranslations("claim");
  const [state, setState] = useState<FlowState>("loading");
  const [email, setEmail] = useState("");
  const [bioCode, setBioCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

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

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Loading — hidden
  if (state === "loading") return null;

  // Unclaimed — single inline CTA
  if (state === "unclaimed") {
    if (compact) {
      return (
        <button
          onClick={() => setState("email_form")}
          className="shrink-0 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-contrast hover:bg-primary-dark transition-colors"
        >
          {t("claimButton")}
        </button>
      );
    }
    return (
      <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary-light/50 px-4 py-2.5">
        <p className="text-sm text-primary-dark">
          {t("claimInline")}
        </p>
        <button
          onClick={() => setState("email_form")}
          className="shrink-0 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-contrast hover:bg-primary-dark transition-colors"
        >
          {t("claimButton")}
        </button>
      </div>
    );
  }

  // Email form
  if (state === "email_form") {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary-light/50 p-4 space-y-3">
        <p className="text-sm text-primary-dark font-medium">
          {t("emailPrompt", { name })}
        </p>
        <form onSubmit={handleSubmitEmail} className="flex gap-2">
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
            className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-contrast hover:bg-primary-dark transition-colors disabled:opacity-50"
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
        </form>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }

  // Email sent
  if (state === "email_sent") {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary-light/50 p-4 space-y-1">
        <p className="text-sm text-primary-dark font-semibold">
          {t("checkInbox")}
        </p>
        <p className="text-xs text-primary-dark">
          {t.rich("emailSentMessage", {
            email,
            bold: (chunks) => <span className="font-medium">{chunks}</span>,
          })}
        </p>
      </div>
    );
  }

  // Pending bio verification
  if (state === "pending_bio") {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary-light/50 p-4 space-y-3">
        <p className="text-sm text-primary-dark font-medium">
          {t("bioPrompt", { platform: pLabel })}
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-surface border border-primary/20 px-4 py-2.5 text-base font-bold font-mono tracking-wider text-primary text-center">
            {bioCode}
          </code>
          <button
            onClick={() => copyToClipboard(bioCode)}
            className="shrink-0 rounded-lg border border-primary/30 px-3 py-2.5 text-xs font-medium text-primary-dark hover:bg-primary/10 transition-colors"
          >
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
        <p className="text-xs text-text-muted">{t("bioRemovalNote")}</p>
        <button
          onClick={handleConfirmBio}
          disabled={submitting}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-contrast hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {submitting ? t("submitting") : t("bioAdded")}
        </button>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }

  // Pending review
  if (state === "pending_review") {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary-light/50 p-4 space-y-1">
        <p className="text-sm text-primary-dark font-semibold">
          {t("pendingReviewTitle")}
        </p>
        <p className="text-xs text-primary-dark">
          {t("pendingReviewMessage", { platform: pLabel })}
        </p>
      </div>
    );
  }

  // Claimed by other
  if (state === "claimed_by_other") {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary-light/50 px-4 py-2.5">
        <p className="text-sm text-primary-dark font-medium">
          {t("claimedByOther")}
        </p>
      </div>
    );
  }

  // Owned — simplified (no badge for now)
  if (state === "owned") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary-light/50 px-4 py-2.5">
        <svg
          className="w-4 h-4 text-primary shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
        <p className="text-sm text-primary-dark font-semibold">
          {t("youOwnThis")}
        </p>
      </div>
    );
  }

  return null;
}

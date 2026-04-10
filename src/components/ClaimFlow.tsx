"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { platformLabel, type Platform } from "../lib/platform";
import { trackEvent } from "../lib/analytics";

interface ClaimFlowProps {
  platform: Platform;
  handle: string;
  slug: string;
  name: string;
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
}: ClaimFlowProps) {
  const t = useTranslations("claim");
  const [state, setState] = useState<FlowState>("loading");
  const [email, setEmail] = useState("");
  const [bioCode, setBioCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const pLabel = platformLabel(platform);
  const isModalOpen =
    state === "email_form" ||
    state === "email_sent" ||
    state === "pending_bio" ||
    state === "pending_review";

  const handleClose = useCallback(() => {
    setState("unclaimed");
    setError("");
    triggerButtonRef.current?.focus();
  }, []);

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

  // Body scroll lock
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // Focus management: move focus to close button on open
  useEffect(() => {
    if (isModalOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isModalOpen]);

  // Escape key and focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isModalOpen) return;

      if (e.key === "Escape") {
        handleClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, input, a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [isModalOpen, handleClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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
      trackEvent("claim_email_submit", { platform, handle });
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
      trackEvent("claim_bio_confirmed", { platform, handle });
    } catch {
      setError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      trackEvent("claim_bio_copied", { platform, handle });
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Loading — hidden
  if (state === "loading") return null;

  // Unclaimed — inline button (opens modal)
  if (state === "unclaimed") {
    return (
      <button
        ref={triggerButtonRef}
        onClick={() => {
          trackEvent("claim_start", { platform, handle });
          setState("email_form");
        }}
        className="shrink-0 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-contrast hover:bg-primary-dark transition-colors"
      >
        {t("claimButton")}
      </button>
    );
  }

  // Modal states: email_form, email_sent, pending_bio
  if (isModalOpen) {
    return createPortal(
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 motion-reduce:transition-none"
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Dialog */}
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t("claimButton")}
        >
          <div
            ref={dialogRef}
            className="w-full max-w-md rounded-xl border border-border bg-surface shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-text">
                {t("claimButton")}
              </h2>
              <button
                ref={closeButtonRef}
                onClick={handleClose}
                className="rounded-lg p-1.5 text-text-secondary hover:text-text hover:bg-surface-alt transition-colors"
                aria-label={t("close")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 space-y-4">
              {state === "email_form" && (
                <>
                  <p className="text-sm text-text-secondary">
                    {t("emailPrompt", { name })}
                  </p>
                  <form
                    onSubmit={handleSubmitEmail}
                    className="space-y-3"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-contrast hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      {submitting ? t("sending") : t("sendVerification")}
                    </button>
                  </form>
                  {error && <p className="text-xs text-error">{error}</p>}
                </>
              )}

              {state === "email_sent" && (
                <>
                  <p className="text-sm text-text font-semibold">
                    {t("checkInbox")}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {t.rich("emailSentMessage", {
                      email,
                      bold: (chunks) => (
                        <span className="font-medium">{chunks}</span>
                      ),
                    })}
                  </p>
                  <button
                    onClick={handleClose}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text hover:bg-surface-alt transition-colors"
                  >
                    {t("close")}
                  </button>
                </>
              )}

              {state === "pending_bio" && (
                <>
                  <p className="text-sm text-text-secondary">
                    {t("bioPrompt", { platform: pLabel })}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-primary-light/50 border border-primary/20 px-4 py-2.5 text-base font-bold font-mono tracking-wider text-primary text-center">
                      {bioCode}
                    </code>
                    <button
                      onClick={() => copyToClipboard(bioCode)}
                      className="shrink-0 rounded-lg border border-border px-3 py-2.5 text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-alt transition-colors"
                    >
                      {copied ? t("copied") : t("copy")}
                    </button>
                  </div>
                  <p className="text-xs text-text-muted">
                    {t("bioRemovalNote")}
                  </p>
                  <button
                    onClick={handleConfirmBio}
                    disabled={submitting}
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-contrast hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {submitting ? t("submitting") : t("bioAdded")}
                  </button>
                  {error && <p className="text-xs text-error">{error}</p>}
                </>
              )}

              {state === "pending_review" && (
                <>
                  <p className="text-sm text-text font-semibold">
                    {t("pendingReviewTitle")}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {t("pendingReviewMessage", { platform: pLabel })}
                  </p>
                  <button
                    onClick={handleClose}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text hover:bg-surface-alt transition-colors"
                  >
                    {t("close")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </>,
      document.body
    );
  }

  // Claimed by other — inline badge
  if (state === "claimed_by_other") {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary-light/50 px-4 py-2.5">
        <p className="text-sm text-primary-dark font-medium">
          {t("claimedByOther")}
        </p>
      </div>
    );
  }

  // Owned — inline badge
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

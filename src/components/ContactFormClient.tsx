"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trackEvent } from "../lib/analytics";

export default function ContactFormClient() {
  const t = useTranslations("contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (res.ok) {
        setSent(true);
        trackEvent("contact_submit", { subject });
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setSent(false);
    setError(false);
  }

  if (sent) {
    return (
      <div className="mt-8 rounded-lg border border-border bg-surface p-8 text-center">
        <h2 className="text-lg font-bold text-primary">{t("successTitle")}</h2>
        <p className="mt-2 text-sm text-text-secondary">
          {t("successMessage")}
        </p>
        <button
          onClick={handleReset}
          className="mt-4 text-sm text-text-muted hover:text-text transition-colors"
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-lg border border-border bg-surface p-6 space-y-4"
    >
      <div>
        <label
          htmlFor="contact-name"
          className="block text-sm font-medium text-text mb-1"
        >
          {t("nameLabel")}
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="block text-sm font-medium text-text mb-1"
        >
          {t("emailLabel")}
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="block text-sm font-medium text-text mb-1"
        >
          {t("subjectLabel")}
        </label>
        <input
          id="contact-subject"
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={t("subjectPlaceholder")}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-medium text-text mb-1"
        >
          {t("messageLabel")}
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("messagePlaceholder")}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{t("errorMessage")}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-contrast hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {loading ? t("sending") : t("sendButton")}
      </button>
    </form>
  );
}

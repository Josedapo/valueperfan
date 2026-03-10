"use client";

import { useState, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "../i18n/navigation";
import type { Locale } from "../i18n/config";
import { locales } from "../i18n/config";
import { useClickOutside } from "../hooks/useClickOutside";

const LOCALE_CONFIG: Record<
  string,
  { flag: string; label: string; short: string }
> = {
  en: { flag: "🇬🇧", label: "English", short: "EN" },
  es: { flag: "🇪🇸", label: "Español", short: "ES" },
  br: { flag: "🇧🇷", label: "Português", short: "BR" },
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, useCallback(() => setOpen(false), []));

  function handleChange(newLocale: Locale) {
    setOpen(false);
    router.replace(pathname, { locale: newLocale });
  }

  const current = LOCALE_CONFIG[locale];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm hover:border-primary transition-colors"
        aria-label="Change language"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-text-secondary font-medium">{current.short}</span>
        <svg
          className={`w-3.5 h-3.5 text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 rounded-lg border border-border bg-surface shadow-lg z-50 overflow-hidden">
          {locales.map((code) => {
            const config = LOCALE_CONFIG[code];
            const isActive = code === locale;
            return (
              <button
                key={code}
                onClick={() => handleChange(code)}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-primary-light text-primary font-medium"
                    : "text-text hover:bg-surface-alt"
                }`}
              >
                <span className="text-base leading-none">{config.flag}</span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

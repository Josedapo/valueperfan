"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "../i18n/navigation";

type CalculatorType = "value" | "engagement";
type Platform = "instagram" | "tiktok";

const URL_MAP: Record<CalculatorType, Record<Platform, string>> = {
  value: {
    instagram: "/tools/social-media-value-calculator",
    tiktok: "/tools/tiktok-account-value-calculator",
  },
  engagement: {
    instagram: "/tools/instagram-engagement-rate-calculator",
    tiktok: "/tools/tiktok-engagement-rate-calculator",
  },
};

const MORE_CALCULATORS = [
  { href: "/tools/instagram-account-value-calculator", labelKey: "navInstagramValue" },
  { href: "/tools/earned-media-value-calculator", labelKey: "navEarnedMedia" },
];

export default function CalculatorNav({
  activeType,
  activePlatform,
}: {
  activeType: CalculatorType;
  activePlatform: Platform;
}) {
  const t = useTranslations("tools");
  const pathname = usePathname();

  const types: { key: CalculatorType; label: string }[] = [
    { key: "value", label: t("navValue") },
    { key: "engagement", label: t("navEngagement") },
  ];

  const platforms: { key: Platform; label: string }[] = [
    { key: "instagram", label: t("navInstagram") },
    { key: "tiktok", label: t("navTiktok") },
  ];

  return (
    <div className="mb-6 space-y-3">
      {/* Calculator type tabs */}
      <div className="flex gap-1 rounded-lg bg-surface-alt p-1">
        {types.map(({ key, label }) => (
          <Link
            key={key}
            href={URL_MAP[key][activePlatform]}
            className={`flex-1 rounded-md px-4 py-2 text-center text-sm font-medium transition-colors ${
              activeType === key
                ? "bg-surface text-primary shadow-sm"
                : "text-text-secondary hover:text-text"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Platform toggle */}
      <div className="flex gap-1 rounded-lg border border-border p-1">
        {platforms.map(({ key, label }) => (
          <Link
            key={key}
            href={URL_MAP[activeType][key]}
            className={`flex-1 rounded-md px-4 py-1.5 text-center text-sm font-medium transition-colors ${
              activePlatform === key
                ? "bg-primary text-primary-contrast"
                : "text-text-secondary hover:text-text"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* More calculators */}
      <div className="flex gap-3 justify-center">
        {MORE_CALCULATORS.map(({ href, labelKey }) => {
          const isActive = pathname.endsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`text-xs transition-colors ${
                isActive
                  ? "text-primary font-medium"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {t(labelKey)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

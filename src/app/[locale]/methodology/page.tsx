import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildRankingMetadata } from "../../../lib/metadata";
import { Link } from "../../../i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "methodology" });

  return buildRankingMetadata({
    locale,
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/methodology",
  });
}

export default async function MethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("methodology");

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold text-text">
        {t("heading")}
      </h1>

      {/* Intro */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
          {t("introTitle")}
        </h2>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          {t("introText")}
        </p>
      </div>

      {/* How it works */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
          {t("howItWorksTitle")}
        </h2>

        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-text">
              {t("step1Title")}
            </h3>
            <p className="mt-1 text-sm text-text-secondary leading-relaxed">
              {t("step1Text")}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text">
              {t("step2Title")}
            </h3>
            <p className="mt-1 text-sm text-text-secondary leading-relaxed">
              {t("step2Text")}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text">
              {t("step3Title")}
            </h3>
            <p className="mt-1 text-sm text-text-secondary leading-relaxed">
              {t("step3Text")}
            </p>
          </div>
        </div>
      </div>

      {/* Value Per Fan */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
          {t("vpfTitle")}
        </h2>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          {t("vpfText")}
        </p>
      </div>

      {/* Why different */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
          {t("whyDifferentTitle")}
        </h2>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          {t("whyDifferentText")}
        </p>
      </div>

      {/* Trusted by */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
          {t("trustedTitle")}
        </h2>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          {t.rich("trustedText", {
            link: (chunks) => (
              <a
                href="https://www.horizm.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:text-primary-dark transition-colors"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
        <a
          href="https://www.horizm.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          {t("trustedCta")}
        </a>
      </div>

      {/* Limitations */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">
          {t("limitationsTitle")}
        </h2>
        <ul className="space-y-2 text-sm text-text-secondary leading-relaxed">
          <li className="flex gap-2">
            <span className="text-text-muted shrink-0">&bull;</span>
            {t("limitation1")}
          </li>
          <li className="flex gap-2">
            <span className="text-text-muted shrink-0">&bull;</span>
            {t("limitation2")}
          </li>
          <li className="flex gap-2">
            <span className="text-text-muted shrink-0">&bull;</span>
            {t("limitation3")}
          </li>
          <li className="flex gap-2">
            <span className="text-text-muted shrink-0">&bull;</span>
            {t("limitation4")}
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-6 rounded-lg border border-primary bg-primary-light p-6 text-center">
        <h2 className="text-base font-bold text-text">{t("ctaTitle")}</h2>
        <p className="mt-1 text-sm text-text-secondary">{t("ctaText")}</p>
        <Link
          href="/tools/social-media-value-calculator"
          className="mt-3 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-contrast hover:bg-primary-dark transition-colors"
        >
          {t("ctaButton")}
        </Link>
      </div>
    </div>
  );
}

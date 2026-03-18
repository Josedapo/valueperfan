import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildRankingMetadata } from "../../../lib/metadata";
import { Link } from "../../../i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return buildRankingMetadata({
    locale,
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/about",
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const stats = [
    { value: t("horizmStat1"), label: t("horizmStat1Label") },
    { value: t("horizmStat2"), label: t("horizmStat2Label") },
    { value: t("horizmStat3"), label: t("horizmStat3Label") },
    { value: t("horizmStat4"), label: t("horizmStat4Label") },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold text-text">
        {t("heading")}
      </h1>

      {/* What is ValuePerFan */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
          {t("whatIsTitle")}
        </h2>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          {t("whatIsText")}
        </p>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          {t("whatIsText2")}
        </p>
      </div>

      {/* Powered by Horizm */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
            {t("horizmTitle")}
          </h2>
          <a
            href="https://www.horizm.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/images/horizm-logo.png"
              alt="Horizm"
              width={80}
              height={24}
              className="h-5 w-auto"
            />
          </a>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          {t.rich("horizmText", {
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

        {/* Stats grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg bg-surface-alt px-3 py-3 text-center"
            >
              <p className="text-lg font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm text-text-secondary leading-relaxed">
          {t("horizmText2")}
        </p>
      </div>

      {/* Methodology */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
          {t("methodologyTitle")}
        </h2>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          {t("methodologyText")}
        </p>
        <Link
          href="/methodology"
          className="mt-3 inline-block text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          {t("methodologyLink")}
        </Link>
      </div>

      {/* Contact */}
      <div className="mt-6 rounded-lg border border-primary bg-primary-light p-6 text-center">
        <h2 className="text-base font-bold text-text">
          {t("contactTitle")}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          {t("contactText")}
        </p>
        <Link
          href="/contact"
          className="mt-3 inline-block text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          {t("contactLink")}
        </Link>
      </div>
    </div>
  );
}

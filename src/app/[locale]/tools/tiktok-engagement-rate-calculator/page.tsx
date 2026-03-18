import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildRankingMetadata } from "../../../../lib/metadata";
import EngagementCalculatorClient from "../../../../components/EngagementCalculatorClient";
import CalculatorNav from "../../../../components/CalculatorNav";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "tools.tiktokEngagementRateCalculator",
  });

  return buildRankingMetadata({
    locale,
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/tools/tiktok-engagement-rate-calculator",
  });
}

export default async function TiktokEngagementRateCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tools.tiktokEngagementRateCalculator");
  const tTools = await getTranslations("tools");

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold text-text">
        {t("heading")}
      </h1>
      <p className="mt-3 mb-6 text-base text-text-secondary leading-relaxed">
        {t("intro")}
      </p>

      <CalculatorNav activeType="engagement" activePlatform="tiktok" />

      <EngagementCalculatorClient platformFilter="tiktok" />

      {/* Educational content */}
      <div className="mt-10 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
          {t("whatIs")}
        </h2>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          {t("whatIsText")}
        </p>
      </div>

      <p className="mt-6 text-xs text-text-muted">{tTools("poweredBy")}</p>
    </div>
  );
}

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildRankingMetadata } from "../../../../lib/metadata";
import ValueCalculatorClient from "../../../../components/ValueCalculatorClient";
import CalculatorNav from "../../../../components/CalculatorNav";
import { getAccountsData } from "../../../../lib/data";
import { formatDataMonth } from "../../../../lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "tools.socialMediaValueCalculator",
  });

  return buildRankingMetadata({
    locale,
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/tools/social-media-value-calculator",
  });
}

export default async function SocialMediaValueCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tools.socialMediaValueCalculator");
  const tTools = await getTranslations("tools");
  const formattedDataMonth = formatDataMonth(getAccountsData().meta.dataMonth, locale);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold text-text">
        {t("heading")}
      </h1>
      <p className="mt-3 mb-6 text-base text-text-secondary leading-relaxed">
        {t("intro")}
      </p>

      <CalculatorNav activeType="value" activePlatform="instagram" />

      <ValueCalculatorClient platformFilter="instagram" dataMonth={formattedDataMonth} />

      {/* Educational content */}
      <div className="mt-10 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
          {t("whatIsPme")}
        </h2>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          {t("whatIsPmeText")}
        </p>
      </div>

      <p className="mt-6 text-xs text-text-muted">{tTools("poweredBy")}</p>
    </div>
  );
}

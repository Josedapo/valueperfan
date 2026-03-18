import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildRankingMetadata } from "../../../lib/metadata";
import ContactFormClient from "../../../components/ContactFormClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return buildRankingMetadata({
    locale,
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/contact",
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold text-text">
        {t("heading")}
      </h1>

      <ContactFormClient />
    </div>
  );
}

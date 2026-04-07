import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales } from "../../i18n/config";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  SponsorCard,
  AdvertiseSlot,
  MobileSponsorBar,
} from "../../components/SponsorColumn";
import { getAccountsData } from "../../lib/data";
import { SPONSORS } from "../../lib/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: {
      default: t("title"),
      template: "%s | ValuePerFan",
    },
    description: t("description"),
    icons: {
      icon: "/favicon.png",
      apple: "/apple-touch-icon.png",
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <MobileSponsorBar />
      <Header />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:max-w-[1700px]">
        <div className="xl:grid xl:grid-cols-[200px_1fr_200px] xl:gap-8">
          {/* Left sponsor column — desktop only */}
          <aside className="hidden xl:block">
            <div className="sticky top-4 pt-8 space-y-4">
              <SponsorCard {...SPONSORS[0]} />
              <AdvertiseSlot />
            </div>
          </aside>

          {/* Main content */}
          <main className="py-8">{children}</main>

          {/* Right sponsor column — desktop only */}
          <aside className="hidden xl:block">
            <div className="sticky top-4 pt-8 space-y-4">
              <SponsorCard {...SPONSORS[1]} />
              <AdvertiseSlot />
            </div>
          </aside>
        </div>
      </div>
      <Footer dataMonth={getAccountsData().meta.dataMonth} />
    </NextIntlClientProvider>
  );
}

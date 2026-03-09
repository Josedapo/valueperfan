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
      icon: "/favicon.svg",
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
              <SponsorCard
                name="Horizm"
                description="Maximize your partnerships outcome"
                url="https://www.horizm.com"
                logo="/images/horizm-logo.png"
              />
              <AdvertiseSlot />
            </div>
          </aside>

          {/* Main content */}
          <main className="py-8">{children}</main>

          {/* Right sponsor column — desktop only */}
          <aside className="hidden xl:block">
            <div className="sticky top-4 pt-8 space-y-4">
              <SponsorCard
                name="Lume"
                description="Show your value. Know what your content is worth"
                url="https://getlumeapp.com"
                logo="/images/lume-logo.png"
              />
              <AdvertiseSlot />
            </div>
          </aside>
        </div>
      </div>
      <Footer dataMonth={getAccountsData().meta.dataMonth} />
    </NextIntlClientProvider>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  SponsorCard,
  AdvertiseSlot,
  MobileSponsorBar,
} from "../components/SponsorColumn";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ValuePerFan — The real value of social media followers",
    template: "%s | ValuePerFan",
  },
  description:
    "Value Per Fan measures the real economic value each follower generates. Objective valuations powered by Paid Media Equivalence. Not followers. Not likes. Real money.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MobileSponsorBar />
        <Header />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:max-w-[1700px]">
          <div className="xl:grid xl:grid-cols-[200px_1fr_200px] xl:gap-8">
            {/* Left sponsor column — desktop only */}
            <aside className="hidden xl:block">
              <div className="sticky top-4 pt-8 space-y-4">
                <SponsorCard
                  name="Horizm"
                  description="Social media valuation for Rights Holders"
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
                  description="Know your real value as a creator"
                  url="https://getlumeapp.com"
                  logo="/images/lume-logo.png"
                />
                <AdvertiseSlot />
              </div>
            </aside>
          </div>
        </div>
        <Footer />
      </body>
    </html>
  );
}

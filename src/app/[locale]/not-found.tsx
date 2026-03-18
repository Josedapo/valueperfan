"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "../../i18n/navigation";
import SearchBar from "../../components/SearchBar";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function NotFound() {
  const t = useTranslations("notFound");

  useEffect(() => {
    if (window.gtag) {
      window.gtag("event", "page_not_found", {
        page_path: window.location.pathname,
      });
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-6xl font-bold text-border">404</h1>
      <h2 className="mt-4 text-xl font-semibold text-text">{t("title")}</h2>
      <p className="mt-2 text-text-muted">{t("description")}</p>

      <section className="mt-8 w-full max-w-xl">
        <SearchBar />
      </section>

      <div className="mt-8 flex flex-col gap-3 text-sm">
        <p className="text-text-muted font-medium">{t("popularRankings")}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/ranking/topic/athletes" className="rounded-full border border-border px-3 py-1 text-text-secondary hover:text-primary hover:border-primary transition-colors">
            {t("athletes")}
          </Link>
          <Link href="/ranking/topic/musicians-and-bands" className="rounded-full border border-border px-3 py-1 text-text-secondary hover:text-primary hover:border-primary transition-colors">
            {t("musicians")}
          </Link>
          <Link href="/ranking/topic/actors-and-actresses" className="rounded-full border border-border px-3 py-1 text-text-secondary hover:text-primary hover:border-primary transition-colors">
            {t("actors")}
          </Link>
          <Link href="/ranking/topic/content-creators-and-influencers" className="rounded-full border border-border px-3 py-1 text-text-secondary hover:text-primary hover:border-primary transition-colors">
            {t("creators")}
          </Link>
          <Link href="/ranking/topic/sports-organizations" className="rounded-full border border-border px-3 py-1 text-text-secondary hover:text-primary hover:border-primary transition-colors">
            {t("sports")}
          </Link>
        </div>
      </div>

      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-contrast hover:bg-primary-dark transition-colors"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}

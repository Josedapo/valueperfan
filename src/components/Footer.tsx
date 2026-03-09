import { useTranslations } from "next-intl";

function formatDataMonth(dataMonth: string, locale: string): string {
  const [year, month] = dataMonth.split("-").map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString(locale === "br" ? "pt-BR" : locale, {
    month: "long",
    year: "numeric",
  });
}

export default function Footer({ dataMonth }: { dataMonth: string }) {
  const t = useTranslations("footer");
  const locale = t("_locale");
  const formattedMonth = formatDataMonth(dataMonth, locale);

  return (
    <footer className="border-t border-border bg-surface py-8 mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-text">
              Value<span className="text-primary">Per</span>Fan
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {t("description")}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {t("dataUpdated", { month: formattedMonth })}
            </p>
          </div>
          <p className="text-xs text-text-muted shrink-0">{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}

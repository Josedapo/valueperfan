import Image from "next/image";
import { useTranslations } from "next-intl";
import { formatDataMonth } from "../lib/utils";

export default function Footer({ dataMonth }: { dataMonth: string }) {
  const t = useTranslations("footer");
  const locale = t("_locale");
  const formattedMonth = formatDataMonth(dataMonth, locale);
  // Published month = month after data month
  const [year, month] = dataMonth.split("-").map(Number);
  const publishedDate = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, "0")}`;
  const formattedPublished = formatDataMonth(publishedDate, locale);

  return (
    <footer className="border-t border-border bg-surface py-8 mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Image
              src="/images/brand/vpf-positive-color.png"
              alt="value per fan"
              width={240}
              height={48}
              className="h-12 w-auto dark:hidden"
            />
            <Image
              src="/images/brand/vpf-negative-color.png"
              alt="value per fan"
              width={240}
              height={48}
              className="h-12 w-auto hidden dark:block"
            />
            <p className="mt-2 text-xs text-text-muted">
              {t("description")}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {t("dataFrom", { month: formattedMonth, published: formattedPublished })}
            </p>
          </div>
          <p className="text-xs text-text-muted shrink-0">{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}

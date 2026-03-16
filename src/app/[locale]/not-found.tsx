import { useTranslations } from "next-intl";
import { Link } from "../../i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <h2 className="mt-4 text-xl font-semibold text-gray-900">{t("title")}</h2>
      <p className="mt-2 text-gray-600">{t("description")}</p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}

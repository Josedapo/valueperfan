import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "../i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const t = useTranslations("header");

  return (
    <header className="bg-surface border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/icon.svg"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <div>
              <span className="text-xl font-bold text-primary">
                Value<span className="text-text">Per</span>Fan
              </span>
              <p className="hidden sm:block text-xs text-text-secondary -mt-0.5">
                {t.rich("tagline", {
                  accent: (chunks) => (
                    <span className="text-primary font-medium">{chunks}</span>
                  ),
                })}
              </p>
            </div>
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

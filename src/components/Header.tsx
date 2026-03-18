import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "../i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const t = useTranslations("header");
  const tNav = useTranslations("nav");

  return (
    <header className="bg-surface border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/images/icon.svg"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <span className="text-xl font-bold text-primary">
              Value<span className="text-text">Per</span>Fan
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-5">
            <Link
              href="/"
              className="text-sm text-text-secondary hover:text-primary transition-colors"
            >
              {tNav("rankings")}
            </Link>
            <Link
              href="/tools/social-media-value-calculator"
              className="text-sm text-text-secondary hover:text-primary transition-colors"
            >
              {tNav("calculators")}
            </Link>
            <Link
              href="/methodology"
              className="text-sm text-text-secondary hover:text-primary transition-colors"
            >
              {tNav("methodology")}
            </Link>
            <Link
              href="/about"
              className="text-sm text-text-secondary hover:text-primary transition-colors"
            >
              {tNav("about")}
            </Link>
            <Link
              href="/contact"
              className="text-sm text-text-secondary hover:text-primary transition-colors"
            >
              {tNav("contact")}
            </Link>
          </nav>

          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

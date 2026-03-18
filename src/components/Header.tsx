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
              src="/images/brand/vpf-imago-color.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 dark:hidden"
            />
            <Image
              src="/images/brand/vpf-imago-white.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 hidden dark:block"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold text-text">
                value <span className="text-primary">per</span> fan
              </span>
              <span className="text-[10px] text-text-secondary tracking-wide">
                {t.rich("tagline", {
                  accent: (chunks) => <span className="font-bold text-primary">{chunks}</span>,
                })}
              </span>
            </div>
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

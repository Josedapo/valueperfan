import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "../i18n/navigation";
import NavLink from "./NavLink";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";

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

          <nav className="hidden lg:flex items-center gap-5">
            <NavLink href="/">{tNav("rankings")}</NavLink>
            <NavLink href="/tools/social-media-value-calculator">{tNav("calculators")}</NavLink>
            <NavLink href="/methodology">{tNav("methodology")}</NavLink>
            <NavLink href="/about">{tNav("about")}</NavLink>
            <NavLink href="/contact">{tNav("contact")}</NavLink>
          </nav>

          <div className="hidden lg:block">
            <LanguageSwitcher />
          </div>

          <MobileMenu
            navItems={[
              { href: "/", label: tNav("rankings") },
              { href: "/tools/social-media-value-calculator", label: tNav("calculators") },
              { href: "/methodology", label: tNav("methodology") },
              { href: "/about", label: tNav("about") },
              { href: "/contact", label: tNav("contact") },
            ]}
            menuLabel={t("openMenu")}
            closeLabel={t("closeMenu")}
          />
        </div>
      </div>
    </header>
  );
}

"use client";

import { Link, usePathname } from "../i18n/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();

  const isActive =
    href === "/"
      ? pathname === "/" || pathname.startsWith("/ranking")
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`text-sm transition-colors ${
        isActive
          ? "text-primary font-medium"
          : "text-text-secondary hover:text-primary"
      }`}
    >
      {children}
    </Link>
  );
}

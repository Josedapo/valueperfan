"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, usePathname } from "../i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

interface NavItem {
  href: string;
  label: string;
}

interface MobileMenuProps {
  navItems: NavItem[];
  menuLabel: string;
  closeLabel: string;
}

export default function MobileMenu({
  navItems,
  menuLabel,
  closeLabel,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Close on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Focus management: move focus to close button on open, return to hamburger on close
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Escape key and focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        setIsOpen(false);
        hamburgerRef.current?.focus();
        return;
      }

      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [isOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="lg:hidden">
      {/* Hamburger button */}
      <button
        ref={hamburgerRef}
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-surface-alt transition-colors"
        aria-label={menuLabel}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 motion-reduce:transition-none ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal={isOpen}
        aria-label={menuLabel}
        className={`fixed inset-y-0 right-0 w-72 max-w-[80vw] bg-surface border-l border-border shadow-xl z-50 flex flex-col transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-end px-4 h-16 border-b border-border">
          <button
            ref={closeButtonRef}
            onClick={() => {
              setIsOpen(false);
              hamburgerRef.current?.focus();
            }}
            className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-surface-alt transition-colors"
            aria-label={closeLabel}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-6 py-3 text-base font-medium transition-colors ${
                  isActive
                    ? "text-primary bg-primary-light"
                    : "text-text hover:bg-surface-alt hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Language switcher */}
        <div className="border-t border-border px-6 py-4">
          <LanguageSwitcher dropUp />
        </div>
      </div>
    </div>
  );
}

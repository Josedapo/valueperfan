import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-surface border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">
              Value<span className="text-text">Per</span>Fan
            </span>
          </Link>
          <nav className="text-sm text-text-secondary">
            <span>The real economic value of social media</span>
          </nav>
        </div>
      </div>
    </header>
  );
}

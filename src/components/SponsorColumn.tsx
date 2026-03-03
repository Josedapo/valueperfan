import Image from "next/image";

export function SponsorCard({
  name,
  description,
  url,
  logo,
}: {
  name: string;
  description: string;
  url: string;
  logo: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-border bg-surface p-4 hover:border-primary transition-colors"
    >
      <div className="flex items-center gap-2.5 mb-2">
        <Image
          src={logo}
          alt={name}
          width={28}
          height={28}
          className="h-7 w-7 object-contain"
        />
        <span className="text-sm font-semibold text-text">{name}</span>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">
        {description}
      </p>
    </a>
  );
}

export function AdvertiseSlot() {
  return (
    <a
      href="mailto:hello@valueperfan.com"
      className="group block rounded-lg border-2 border-dashed border-text-muted p-4 hover:border-primary transition-colors text-center"
    >
      <svg
        className="w-6 h-6 mx-auto text-text-muted group-hover:text-primary transition-colors"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M22 3L12 9H5C3.9 9 3 9.9 3 11V13C3 14.1 3.9 15 5 15H6L8 21H10L8 15H12L22 21V3Z" />
      </svg>
      <p className="text-sm font-semibold text-text-muted group-hover:text-primary transition-colors mt-2">
        Advertise
      </p>
      <p className="text-xs text-text-muted mt-0.5">18/20 spots left</p>
    </a>
  );
}

export function MobileSponsorBar() {
  const sponsors = [
    {
      name: "Horizm",
      url: "https://www.horizm.com",
      logo: "/images/horizm-logo.png",
    },
    {
      name: "Lume",
      url: "https://getlumeapp.com",
      logo: "/images/lume-logo.png",
    },
  ];

  return (
    <div className="xl:hidden bg-surface border-b border-border">
      <div className="flex items-center justify-center gap-6 px-4 py-2 overflow-x-auto text-xs">
        {sponsors.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 shrink-0 text-text hover:text-primary transition-colors"
          >
            <Image
              src={s.logo}
              alt={s.name}
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain shrink-0"
            />
            <span className="font-medium">{s.name}</span>
          </a>
        ))}
        <a
          href="mailto:hello@valueperfan.com"
          className="flex items-center gap-1.5 shrink-0 text-text-muted hover:text-primary transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M22 3L12 9H5C3.9 9 3 9.9 3 11V13C3 14.1 3.9 15 5 15H6L8 21H10L8 15H12L22 21V3Z" />
          </svg>
          <span>Advertise</span>
        </a>
      </div>
    </div>
  );
}

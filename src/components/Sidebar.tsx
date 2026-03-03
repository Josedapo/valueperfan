export default function Sidebar() {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="flex flex-row gap-4 lg:flex-col">
        <SponsorSlot
          title="Horizm"
          description="Social media valuation for Rights Holders"
          url="https://www.horizm.com"
        />
        <SponsorSlot
          title="Lume"
          description="Know your real value as a creator"
          url="#"
        />
        <SponsorSlot
          title="Advertise here"
          description="Reach creators and brands"
          url="mailto:hello@valueperfan.com"
          isPlaceholder
        />
      </div>
    </aside>
  );
}

function SponsorSlot({
  title,
  description,
  url,
  isPlaceholder = false,
}: {
  title: string;
  description: string;
  url: string;
  isPlaceholder?: boolean;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block flex-1 rounded-lg border p-4 transition-colors ${
        isPlaceholder
          ? "border-dashed border-text-muted hover:border-primary"
          : "border-border hover:border-primary"
      }`}
    >
      <p className="text-sm font-semibold text-text">{title}</p>
      <p className="mt-1 text-xs text-text-secondary">{description}</p>
    </a>
  );
}

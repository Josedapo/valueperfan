export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-8 mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-text">
              Value<span className="text-primary">Per</span>Fan
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Economic valuations based on Paid Media Equivalence (PME)
            </p>
          </div>
          <div className="text-xs text-text-muted">
            <p>
              Valuations are estimates based on public data and proprietary
              algorithms.
            </p>
            <p className="mt-1">
              Instagram Stories are not included in calculations due to their
              ephemeral nature.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

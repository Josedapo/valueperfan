import type { Account } from "../lib/types";
import { formatVPF } from "../lib/utils";

export default function BadgePreview({ account }: { account: Account }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-text">
            Embeddable Badge
          </h3>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-alt px-3 py-1.5 text-sm">
            <span className="font-bold text-primary">VPF</span>
            <span className="text-text font-medium">
              {formatVPF(account.valuePerFan)}/fan
            </span>
            <span className="text-text-muted">#{account.rank.vpf}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-text-secondary">
            Claim this account to get your embeddable badge
          </p>
          <button
            disabled
            className="shrink-0 rounded-lg bg-border px-4 py-2 text-xs font-medium text-text-muted cursor-not-allowed"
          >
            Copy Embed Code
          </button>
        </div>
      </div>
    </div>
  );
}

import type { Account } from "../lib/types";
import { formatVPF } from "../lib/utils";

export default function BadgePreview({ account }: { account: Account }) {
  return (
    <div className="rounded-lg border-2 border-primary/30 bg-primary-light p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <h3 className="text-sm font-semibold text-primary">
              Embeddable Badge
            </h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface px-3 py-1.5 text-sm">
            <span className="font-bold text-primary">VPF</span>
            <span className="text-text font-medium">
              {formatVPF(account.valuePerFan)}/fan
            </span>
            <span className="text-text-muted">#{account.rank.vpf}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-primary-dark font-medium">
            Claim this account to get your embeddable badge
          </p>
          <button
            disabled
            className="shrink-0 rounded-lg bg-primary/20 border border-primary/30 px-4 py-2 text-xs font-medium text-primary-dark cursor-not-allowed"
          >
            Copy Embed Code
          </button>
        </div>
      </div>
    </div>
  );
}

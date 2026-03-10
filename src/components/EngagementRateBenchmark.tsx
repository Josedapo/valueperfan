import { getEngagementRateBenchmark } from "../lib/data";
import type { Platform } from "../lib/platform";

export default function EngagementRateBenchmark({
  engRate,
  category,
  platform,
  platformLabel: pLabel,
  t,
}: {
  engRate: number;
  category: string;
  platform: Platform;
  platformLabel: string;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const benchmark = getEngagementRateBenchmark(category, platform, engRate);
  const accountPct = (engRate * 100).toFixed(2);

  if (!benchmark) {
    return (
      <div className="mt-3 rounded-lg bg-surface-alt px-4 py-3 text-center">
        <p className="text-xs text-text-secondary">{t("engRateLabel")}</p>
        <p className="mt-1 text-lg font-bold text-text">{accountPct}%</p>
      </div>
    );
  }

  const medianPct = (benchmark.median * 100).toFixed(2);
  const position = Math.min(Math.max(benchmark.percentile, 2), 98);
  const isTopHalf = benchmark.percentile >= 50;
  const displayPercentile = Math.max(
    1,
    isTopHalf ? 100 - benchmark.percentile : benchmark.percentile
  );

  const tier =
    benchmark.percentile >= 50 ? "green" : benchmark.percentile >= 25 ? "amber" : "red";
  const barColor = { green: "bg-emerald-400", amber: "bg-amber-400", red: "bg-red-400" }[tier];
  const dotColor = { green: "bg-emerald-500", amber: "bg-amber-500", red: "bg-red-500" }[tier];
  const labelColor = { green: "text-emerald-400", amber: "text-amber-400", red: "text-red-400" }[tier];

  return (
    <div className="mt-3 rounded-lg bg-surface-alt px-4 py-4">
      {/* Numbers row */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-center flex-1">
          <p className="text-xs text-text-secondary">{t("engRateLabel")}</p>
          <p className="mt-1 text-2xl font-bold text-text">{accountPct}%</p>
        </div>

        <div className="w-px h-10 bg-border mx-4" />

        <div className="text-center flex-1">
          <p className="text-xs text-text-secondary">
            {t("engRateBenchmarkMedian", { category, platform: pLabel })}
          </p>
          <p className="mt-1 text-2xl font-bold text-text-secondary">
            {medianPct}%
          </p>
        </div>
      </div>

      {/* Progress bar with floating label */}
      <div className="relative h-2 rounded-full bg-border overflow-visible mt-9">
        <div
          className={`absolute top-0 left-0 h-full rounded-full ${barColor}`}
          style={{ width: `${position}%` }}
        />

        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-text-secondary"
          style={{ left: "50%" }}
          title={`Median: ${medianPct}%`}
        />

        <div
          className="absolute"
          style={{ left: `${position}%`, top: "50%", transform: "translate(-50%, -50%)" }}
        >
          <span
            className={`absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold ${labelColor}`}
          >
            {isTopHalf
              ? t("engRateBenchmarkPercentile", { percentile: displayPercentile })
              : t("engRateBenchmarkBottom", { percentile: displayPercentile })}
          </span>
          <div
            className={`w-3 h-3 rounded-full border-2 border-surface ${dotColor}`}
          />
        </div>
      </div>

      {/* Labels under bar */}
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-text-muted">{t("engRateBenchmarkLow")}</span>
        <span className="text-[10px] text-text-muted">{t("engRateBenchmarkMedianLabel")}</span>
        <span className="text-[10px] text-text-muted">{t("engRateBenchmarkHigh")}</span>
      </div>
    </div>
  );
}

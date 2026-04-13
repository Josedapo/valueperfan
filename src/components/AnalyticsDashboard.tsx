"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface AnalyticsData {
  period: number;
  acquisition: {
    organicSessions: number;
    organicSessionsPrevious: number;
    totalSessions: number;
    dailySessions: { date: string; total: number; organic: number }[];
    channels: { name: string; value: number }[];
    landingPages: { page: string; sessions: number; users: number }[];
  };
  product: {
    events: { name: string; value: number }[];
    calculatorsByPlatform: { name: string; value: number }[];
    claimFunnel: { name: string; value: number }[];
  };
}

const PERIODS = [
  { label: "7d", value: 7 },
  { label: "28d", value: 28 },
  { label: "90d", value: 90 },
];

const COLORS = {
  primary: "#059669",
  gray: "#6b7280",
  blue: "#2563eb",
  amber: "#f59e0b",
  purple: "#8b5cf6",
};

function sumEvents(
  events: { name: string; value: number }[],
  names: string[],
): number {
  return events
    .filter((e) => names.includes(e.name))
    .reduce((sum, e) => sum + e.value, 0);
}

function Scorecard({
  label,
  value,
  suffix,
  change,
  target,
}: {
  label: string;
  value: number;
  suffix?: string;
  change?: number;
  target?: number;
}) {
  const changePercent =
    change !== undefined && change > 0
      ? (((value - change) / change) * 100).toFixed(1)
      : null;
  const isPositive = changePercent ? parseFloat(changePercent) > 0 : false;

  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <p className="text-text-secondary text-sm">{label}</p>
      <p className="text-text text-3xl font-bold mt-1">
        {value.toLocaleString()}
        {suffix}
      </p>
      <div className="flex items-center gap-2 mt-1 min-h-[20px]">
        {changePercent && (
          <span
            className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}
          >
            {isPositive ? "+" : ""}
            {changePercent}%
          </span>
        )}
        {target !== undefined && (
          <span className="text-text-muted text-xs">
            Target: {target.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}

function InfoIcon({ tooltip }: { tooltip: string }) {
  return (
    <span className="relative group ml-1 inline-flex">
      <svg
        className="w-3.5 h-3.5 text-text-muted cursor-help"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-text text-surface text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
        {tooltip}
      </span>
    </span>
  );
}

function MiniScorecard({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: number;
  tooltip?: string;
}) {
  return (
    <div className="bg-surface rounded-lg border border-border p-3">
      <p className="text-text-secondary text-xs flex items-center">
        {label}
        {tooltip && <InfoIcon tooltip={tooltip} />}
      </p>
      <p className="text-text text-2xl font-bold mt-1">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-text mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      {children}
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-surface-alt rounded-lg" />
        ))}
      </div>
      <div className="h-80 bg-surface-alt rounded-lg" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 bg-surface-alt rounded-lg" />
        <div className="h-64 bg-surface-alt rounded-lg" />
      </div>
    </div>
  );
}

export default function AnalyticsDashboard({ apiKey }: { apiKey: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState(28);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());

  const handleLegendClick = (dataKey: string) => {
    setHiddenLines((prev) => {
      const next = new Set(prev);
      if (next.has(dataKey)) next.delete(dataKey);
      else next.add(dataKey);
      return next;
    });
  };

  const fetchData = useCallback(
    async (days: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/admin/analytics?key=${apiKey}&period=${days}`,
        );
        if (!res.ok) {
          if (res.status === 401) throw new Error("Invalid access key");
          throw new Error("Failed to fetch data");
        }
        setData(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [apiKey],
  );

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-error text-lg">{error}</p>
      </div>
    );
  }

  const dailyTarget =
    period === 7
      ? Math.round(500 / 30)
      : period === 90
        ? Math.round(500 / 30)
        : Math.round(500 / 30);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-text">Product Analytics</h1>
        <div className="flex gap-1 bg-surface-alt rounded-lg p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p.value
                  ? "bg-surface text-text shadow-sm"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* 1. Acquisition */}
          <Section title="Acquisition">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Scorecard
                label="Organic Sessions"
                value={data.acquisition.organicSessions}
                change={data.acquisition.organicSessionsPrevious}
                target={period === 28 ? 500 : undefined}
              />
              <Scorecard
                label="Total Sessions"
                value={data.acquisition.totalSessions}
              />
              <Scorecard
                label="Organic Share"
                value={
                  data.acquisition.totalSessions > 0
                    ? Math.round(
                        (data.acquisition.organicSessions /
                          data.acquisition.totalSessions) *
                          100,
                      )
                    : 0
                }
                suffix="%"
              />
            </div>

            {/* Daily sessions */}
            <div className="bg-surface rounded-lg border border-border p-4 mb-6">
              <h3 className="text-sm font-medium text-text-secondary mb-4">
                Daily Sessions
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.acquisition.dailySessions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    stroke="#9ca3af"
                  />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Legend
                    onClick={(e) => handleLegendClick(e.dataKey as string)}
                    wrapperStyle={{ cursor: "pointer" }}
                  />
                  <ReferenceLine
                    y={dailyTarget}
                    stroke={COLORS.amber}
                    strokeDasharray="5 5"
                    label={{
                      value: `~${dailyTarget}/day target`,
                      fill: COLORS.amber,
                      fontSize: 11,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke={COLORS.gray}
                    strokeWidth={1.5}
                    dot={false}
                    hide={hiddenLines.has("total")}
                  />
                  <Line
                    type="monotone"
                    dataKey="organic"
                    name="Organic"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={false}
                    hide={hiddenLines.has("organic")}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Channel breakdown + Landing pages */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface rounded-lg border border-border p-4">
                <h3 className="text-sm font-medium text-text-secondary mb-4">
                  Traffic by Channel
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={data.acquisition.channels}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11 }}
                      stroke="#9ca3af"
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      stroke="#9ca3af"
                      width={120}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      name="Sessions"
                      fill={COLORS.primary}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-surface rounded-lg border border-border p-4">
                <h3 className="text-sm font-medium text-text-secondary mb-4">
                  Top Landing Pages (Organic)
                </h3>
                <div className="overflow-auto max-h-[250px]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-text-secondary border-b border-border">
                        <th className="text-left py-2 font-medium">Page</th>
                        <th className="text-right py-2 font-medium">
                          Sessions
                        </th>
                        <th className="text-right py-2 font-medium">Users</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.acquisition.landingPages.map((lp) => (
                        <tr
                          key={lp.page}
                          className="border-b border-border/50"
                        >
                          <td
                            className="py-1.5 text-text truncate max-w-[200px]"
                            title={lp.page}
                          >
                            {lp.page}
                          </td>
                          <td className="py-1.5 text-right text-text">
                            {lp.sessions}
                          </td>
                          <td className="py-1.5 text-right text-text-secondary">
                            {lp.users}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Section>

          {/* 2. Product */}
          <Section title="Product">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <MiniScorecard
                label="Calculator Searches"
                tooltip="Account lookups in value or engagement calculators"
                value={sumEvents(data.product.events, [
                  "calculator_search",
                ])}
              />
              <MiniScorecard
                label="Search Queries"
                tooltip="Searches typed in the site search bar"
                value={sumEvents(data.product.events, ["search_query"])}
              />
              <MiniScorecard
                label="Search Clicks"
                tooltip="Clicks on results from the search bar"
                value={sumEvents(data.product.events, [
                  "search_result_click",
                ])}
              />
              <MiniScorecard
                label="Ranking Actions"
                tooltip="Filter, sort, paginate, or platform switch in rankings"
                value={sumEvents(data.product.events, [
                  "ranking_filter",
                  "ranking_metric_toggle",
                  "ranking_page_change",
                  "ranking_platform_change",
                ])}
              />
            </div>

            {/* All events */}
            <div className="bg-surface rounded-lg border border-border p-4 mb-6">
              <h3 className="text-sm font-medium text-text-secondary mb-4">
                Event Counts
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.product.events} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    stroke="#9ca3af"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    stroke="#9ca3af"
                    width={160}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    name="Events"
                    fill={COLORS.blue}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Calculators by platform + Claim funnel */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface rounded-lg border border-border p-4">
                <h3 className="text-sm font-medium text-text-secondary mb-4">
                  Calculator Searches by Platform
                </h3>
                {data.product.calculatorsByPlatform.length > 0 ? (
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={data.product.calculatorsByPlatform}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        stroke="#9ca3af"
                      />
                      <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        name="Searches"
                        fill={COLORS.purple}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[150px] flex items-center justify-center">
                    <p className="text-text-muted text-sm">
                      No calculator searches in this period
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-surface rounded-lg border border-border p-4">
                <h3 className="text-sm font-medium text-text-secondary mb-4">
                  Claim Funnel
                </h3>
                <div className="space-y-3">
                  {data.product.claimFunnel.map((step) => {
                    const maxVal = data.product.claimFunnel[0]?.value || 1;
                    const width =
                      maxVal > 0 ? (step.value / maxVal) * 100 : 0;
                    return (
                      <div key={step.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-text capitalize">
                            {step.name.replace(/_/g, " ")}
                          </span>
                          <span className="text-text-secondary">
                            {step.value}
                          </span>
                        </div>
                        <div className="h-6 bg-surface-alt rounded overflow-hidden">
                          <div
                            className="h-full rounded"
                            style={{
                              width: `${Math.max(width, 2)}%`,
                              backgroundColor: `${COLORS.primary}33`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Section>

          {/* 3. North Star */}
          <Section title="North Star">
            <div className="bg-surface rounded-lg border border-border p-8 text-center">
              <p className="text-text-secondary text-lg">
                Monthly Social Shares (MSS)
              </p>
              <p className="text-text-muted mt-2">
                Pending sharing system implementation (VP-4)
              </p>
            </div>
          </Section>
        </>
      )}
    </div>
  );
}

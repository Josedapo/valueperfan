import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { env } from "./config";

const CUSTOM_EVENTS = [
  "calculator_search",
  "search_query",
  "search_result_click",
  "suggest_submit",
  "ranking_filter",
  "ranking_metric_toggle",
  "ranking_page_change",
  "ranking_platform_change",
  "claim_start",
  "claim_email_submit",
  "claim_bio_copied",
  "claim_bio_confirmed",
  "contact_submit",
  "page_not_found",
];

const CLAIM_STEPS = [
  "claim_start",
  "claim_email_submit",
  "claim_bio_copied",
  "claim_bio_confirmed",
];

interface Row {
  dimensionValues?: ({ value?: string | null } | null)[] | null;
  metricValues?: ({ value?: string | null } | null)[] | null;
}

function createClient() {
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: env.gaClientEmail,
      private_key: env.gaPrivateKey,
    },
  });
}

function num(row: Row | undefined | null, metricIndex: number = 0): number {
  return parseInt(row?.metricValues?.[metricIndex]?.value || "0", 10);
}

function dim(row: Row | undefined | null, dimIndex: number = 0): string {
  return row?.dimensionValues?.[dimIndex]?.value || "";
}

export interface DailySession {
  date: string;
  total: number;
  organic: number;
}

export interface NameValue {
  name: string;
  value: number;
}

export interface LandingPage {
  page: string;
  sessions: number;
  users: number;
}

export interface AnalyticsData {
  period: number;
  acquisition: {
    organicSessions: number;
    organicSessionsPrevious: number;
    totalSessions: number;
    dailySessions: DailySession[];
    channels: NameValue[];
    landingPages: LandingPage[];
  };
  product: {
    events: NameValue[];
    calculatorsByPlatform: NameValue[];
    claimFunnel: NameValue[];
  };
}

export async function fetchAnalytics(days: number = 28): Promise<AnalyticsData> {
  const client = createClient();
  const property = `properties/${env.gaPropertyId}`;
  const current = { startDate: `${days}daysAgo`, endDate: "yesterday" };
  const previous = {
    startDate: `${days * 2}daysAgo`,
    endDate: `${days + 1}daysAgo`,
  };

  const organicFilter = {
    filter: {
      fieldName: "sessionDefaultChannelGroup",
      stringFilter: { value: "Organic Search" },
    },
  };

  const [
    [organicCurrent],
    [organicPrevious],
    [dailyTotal],
    [dailyOrganic],
    [channels],
    [landingPages],
    [events],
    [calcPlatform],
  ] = await Promise.all([
    client.runReport({
      property,
      dateRanges: [current],
      metrics: [{ name: "sessions" }],
      dimensionFilter: organicFilter,
    }),
    client.runReport({
      property,
      dateRanges: [previous],
      metrics: [{ name: "sessions" }],
      dimensionFilter: organicFilter,
    }),
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }],
      dimensionFilter: organicFilter,
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    }),
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "landingPage" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }],
      dimensionFilter: organicFilter,
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 15,
    }),
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          inListFilter: { values: CUSTOM_EVENTS },
        },
      },
    }),
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "customEvent:platform" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          stringFilter: { value: "calculator_search" },
        },
      },
    }),
  ]);

  // Build daily sessions map
  const dailyMap = new Map<string, { total: number; organic: number }>();
  for (const row of dailyTotal.rows || []) {
    dailyMap.set(dim(row), { total: num(row), organic: 0 });
  }
  for (const row of dailyOrganic.rows || []) {
    const date = dim(row);
    const entry = dailyMap.get(date);
    if (entry) entry.organic = num(row);
    else dailyMap.set(date, { total: 0, organic: num(row) });
  }

  const dailySessions: DailySession[] = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date: `${date.slice(4, 6)}/${date.slice(6, 8)}`,
      ...data,
    }));

  // Parse events into map for claim funnel
  const eventsMap = new Map<string, number>();
  for (const row of events.rows || []) {
    eventsMap.set(dim(row), num(row));
  }

  return {
    period: days,
    acquisition: {
      organicSessions: num(organicCurrent.rows?.[0]),
      organicSessionsPrevious: num(organicPrevious.rows?.[0]),
      totalSessions: dailySessions.reduce((sum, d) => sum + d.total, 0),
      dailySessions,
      channels: (channels.rows || []).map((row) => ({
        name: dim(row),
        value: num(row),
      })),
      landingPages: (landingPages.rows || []).map((row) => ({
        page: dim(row),
        sessions: num(row, 0),
        users: num(row, 1),
      })),
    },
    product: {
      events: (events.rows || [])
        .map((row) => ({ name: dim(row), value: num(row) }))
        .sort((a, b) => b.value - a.value),
      calculatorsByPlatform: (calcPlatform.rows || []).map((row) => ({
        name: dim(row),
        value: num(row),
      })),
      claimFunnel: CLAIM_STEPS.map((step) => ({
        name: step.replace("claim_", ""),
        value: eventsMap.get(step) || 0,
      })),
    },
  };
}

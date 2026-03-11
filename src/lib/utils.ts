import exchangeRate from "../data/exchange-rate.json";

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const EUR_TO_USD: number = exchangeRate.rate;

export function formatCurrency(value: number): string {
  const usd = value * EUR_TO_USD;
  if (usd >= 1_000_000) {
    return `$${(usd / 1_000_000).toFixed(1)}M`;
  }
  if (usd >= 1_000) {
    return `$${(usd / 1_000).toFixed(1)}K`;
  }
  return `$${usd.toFixed(0)}`;
}

export function formatVPF(value: number): string {
  const usd = value * EUR_TO_USD * 1000;
  if (usd >= 1_000_000) {
    return `$${(usd / 1_000_000).toFixed(1)}M`;
  }
  if (usd >= 10_000) {
    return `$${(usd / 1_000).toFixed(1)}K`;
  }
  if (usd >= 1_000) {
    return `$${(usd / 1_000).toFixed(2)}K`;
  }
  return `$${usd.toFixed(2)}`;
}

export function countryCodeToFlag(code: string): string {
  if (code === "XX") return "🌍";
  return [...code.toUpperCase()].map(
    (c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0))
  ).join("");
}

export function formatDataMonth(dataMonth: string, locale: string): string {
  const [year, month] = dataMonth.split("-").map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString(locale === "br" ? "pt-BR" : locale, {
    month: "long",
    year: "numeric",
  });
}

export function formatFollowers(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

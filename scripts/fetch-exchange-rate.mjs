/**
 * Fetches the current EUR/USD exchange rate from the Frankfurter API
 * (powered by European Central Bank data) and writes it to a JSON file.
 *
 * Runs automatically before every build via the "prebuild" npm script.
 */

import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "..", "src", "data", "exchange-rate.json");
const FALLBACK_RATE = 1.08;

async function fetchRate() {
  try {
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=EUR&to=USD"
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rate = data.rates.USD;
    console.log(`EUR/USD rate: ${rate} (date: ${data.date})`);
    return { rate, date: data.date, source: "ecb" };
  } catch (err) {
    console.warn(`Failed to fetch exchange rate: ${err.message}`);
    console.warn(`Using fallback rate: ${FALLBACK_RATE}`);
    return {
      rate: FALLBACK_RATE,
      date: new Date().toISOString().split("T")[0],
      source: "fallback",
    };
  }
}

const result = await fetchRate();
writeFileSync(OUTPUT, JSON.stringify(result, null, 2) + "\n");
console.log(`Written to ${OUTPUT}`);

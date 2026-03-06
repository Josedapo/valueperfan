import { Pool } from "@neondatabase/serverless";
import { env } from "./config";
import type { Platform } from "./platform";

export interface ClaimRow {
  id: number;
  platform: Platform;
  handle: string;
  email: string;
  token: string;
  bio_code: string;
  status: "pending_email" | "pending_bio" | "pending_review" | "verified";
  created_at: string;
  email_verified_at: string | null;
  review_requested_at: string | null;
  verified_at: string | null;
}

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: env.postgresUrl });
  }
  return pool;
}

export async function query(
  text: string,
  params: unknown[] = []
): Promise<Record<string, unknown>[]> {
  const { rows } = await getPool().query(text, params);
  return rows as Record<string, unknown>[];
}

export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS claims (
      id SERIAL PRIMARY KEY,
      platform TEXT NOT NULL,
      handle TEXT NOT NULL,
      email TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      bio_code TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending_email',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      email_verified_at TIMESTAMP,
      review_requested_at TIMESTAMP,
      verified_at TIMESTAMP,
      UNIQUE(platform, handle)
    )
  `);
}

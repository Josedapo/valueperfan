import { Pool } from "@neondatabase/serverless";

export interface ClaimRow {
  id: number;
  platform: string;
  handle: string;
  email: string;
  token: string;
  bio_code: string;
  status: string;
  created_at: string;
  email_verified_at: string | null;
  review_requested_at: string | null;
  verified_at: string | null;
}

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const url = process.env.POSTGRES_URL;
    if (!url) throw new Error("POSTGRES_URL is not set");
    pool = new Pool({ connectionString: url });
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

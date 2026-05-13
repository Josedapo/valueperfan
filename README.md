# ValuePerFan — On hold (since 2026-05-13)

This project is paused. The `on-hold-static` branch only serves a static landing page at `valueperfan.com`.

## Reactivation

1. In Vercel → Settings → Git, change Production Branch back to `main`.
2. In Vercel → Settings → Environment Variables, restore the productive secrets: `POSTGRES_URL`, `RESEND_API_KEY`, `GA_PROPERTY_ID`, `GA_CLIENT_EMAIL`, `GA_PRIVATE_KEY`, `CLAIM_SECRET`, `ANALYTICS_SECRET`, `NOTIFICATION_EMAIL`.
3. In Vercel Storage / Neon, resume the Postgres instance. If it was deleted, restore from the dump at `/Users/joseda/Claude/ValuePerFan/backups-on-hold-2026-05-13/`.
4. Run `npm install` locally and verify build with `npm run build`.

## State at pause

- Last production commit: see branch `production-archive`.
- Database dump (if performed) at `/Users/joseda/Claude/ValuePerFan/backups-on-hold-2026-05-13/`.
- The `valueperfan-country-audit` skill is archived at `~/.claude/skills/_archived/valueperfan-country-audit/`.

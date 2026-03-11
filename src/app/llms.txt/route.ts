import { NextResponse } from "next/server";

const CONTENT = `# ValuePerFan
> Public economic valuations of social media accounts using PME (Paid Media Equivalence).

## What is ValuePerFan?
ValuePerFan provides free, public economic valuations for social media accounts (Instagram and TikTok). It uses a proprietary PME (Paid Media Equivalence) algorithm to calculate the real monetary value each account generates from its content. The core metric — Value Per Fan (VPF) — normalizes economic value by follower count, allowing smaller creators to rank alongside larger ones based on actual content value rather than raw audience size.

## Key Concepts
- **PME (Paid Media Equivalence):** Calculates what a brand would need to spend in paid advertising to achieve the same reach and engagement that an account generates organically.
- **Total Value:** The total PME-based economic value an account generates in the last 30 days, expressed in USD.
- **Value Per Fan (VPF):** Total Value divided by number of followers (displayed per 1,000 followers for readability). This is the democratic ranking metric.

## Coverage
- ~2,787 social media accounts indexed
- Platforms: Instagram, TikTok
- Languages: English (default), Spanish, Portuguese (Brazil)

## URL Structure

### Homepage / Global Rankings
- \`/\` — Global ranking (English)
- \`/es\` — Global ranking (Spanish)
- \`/br\` — Global ranking (Portuguese)

### Country Rankings
- \`/ranking/{country-slug}\` — Ranking filtered by country
- Example: \`/ranking/spain\`, \`/ranking/united-states\`

### Category Rankings
- \`/ranking/topic/{category-slug}\` — Ranking filtered by category
- Example: \`/ranking/topic/football\`, \`/ranking/topic/music\`

### Category + Country Rankings
- \`/ranking/topic/{category-slug}/{country-slug}\` — Ranking filtered by both
- Example: \`/ranking/topic/football/spain\`

### Account Pages
- \`/account/{platform}/{handle}\` — Individual account profile
- Example: \`/account/instagram/cristiano\`, \`/account/tiktok/khaby.lame\`

## Data
All valuations are calculated using the PME algorithm. Rankings are updated periodically. Accounts can be sorted by Total Value or Value Per Fan, and filtered by platform (Instagram/TikTok), country, and category.

## Contact
Website: https://valueperfan.com
`;

export async function GET() {
  return new NextResponse(CONTENT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

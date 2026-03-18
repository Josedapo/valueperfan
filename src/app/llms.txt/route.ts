import { NextResponse } from "next/server";

const CONTENT = `# ValuePerFan
> Social media value calculator — economic valuations of social media accounts using Paid Media Equivalence (PME).

## What is ValuePerFan?
ValuePerFan is a social media value calculator that provides economic valuations for any Instagram or TikTok account. It uses Paid Media Equivalence (PME) — a proprietary methodology that calculates the earned media value of organic content by measuring what brands would pay in paid advertising to achieve the same results. The core metric — Value Per Fan — normalizes economic value by follower count, creating a democratic ranking where content quality matters more than audience size.

ValuePerFan is built on the technology behind Horizm (horizm.com), the AI-powered platform used by professional sports and entertainment organizations. The same PME algorithm that powers Horizm has processed 13 trillion+ impressions, 250M+ social media posts, across 128+ countries and 48+ verticals.

## Key Concepts
- **Paid Media Equivalence (PME):** Calculates the earned media value of organic social media content — what a brand would need to spend in paid advertising (Instagram Ads, TikTok Ads) to achieve the same impressions, reach, and engagement.
- **Total Value:** The total PME-based economic value an account generates during the analyzed month, expressed in USD.
- **Value Per Fan:** Total Value divided by number of followers (displayed per 1,000 followers). This is the democratic ranking metric — a creator with 50K engaged fans can rank above a celebrity with millions of passive followers.

## Coverage
- ~8,356 social media accounts indexed
- Platforms: Instagram, TikTok
- Languages: English (default), Spanish, Portuguese (Brazil)
- Categories: Athletes, Entertainment, Media & Creators, Sports Organizations, Sports Teams
- Countries: 40+ countries

## URL Structure

### Homepage / Global Rankings
- \`/\` — Homepage with social media value calculator and global rankings

### Calculator Tools
- \`/tools/social-media-value-calculator\` — Social media value calculator (main tool)
- \`/tools/earned-media-value-calculator\` — Earned media value calculator
- \`/tools/instagram-account-value-calculator\` — Instagram account value calculator
- \`/tools/tiktok-account-value-calculator\` — TikTok account value calculator
- \`/tools/instagram-engagement-rate-calculator\` — Instagram engagement rate calculator with benchmarks
- \`/tools/tiktok-engagement-rate-calculator\` — TikTok engagement rate calculator with benchmarks

### Rankings
- \`/ranking/{country-slug}\` — Country ranking (e.g., /ranking/spain)
- \`/ranking/topic/{category-slug}\` — Category ranking (e.g., /ranking/topic/athletes)
- \`/ranking/topic/{category-slug}/{country-slug}\` — Category + country (e.g., /ranking/topic/athletes/spain)

### Account Pages
- \`/account/{platform}/{handle}\` — Individual account valuation
- Example: \`/account/instagram/cristiano\`, \`/account/tiktok/khaby.lame\`
- Each page includes: total value, Value Per Fan, ranking position, engagement rate with category benchmarks, FAQ

### Information Pages
- \`/methodology\` — How Paid Media Equivalence (PME) works
- \`/about\` — About ValuePerFan and Horizm
- \`/contact\` — Contact form

## Localization
All pages available in 3 languages via URL prefix:
- English (default): \`/\`
- Spanish: \`/es/\`
- Portuguese (Brazil): \`/br/\`

## Data
All valuations are calculated using the Paid Media Equivalence algorithm. Rankings are updated at the end of each month, reflecting the previous month's content performance. Accounts can be sorted by Total Value or Value Per Fan, and filtered by platform, country, and category.

## Contact
Website: https://valueperfan.com
Contact: https://valueperfan.com/contact
`;

export async function GET() {
  return new NextResponse(CONTENT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

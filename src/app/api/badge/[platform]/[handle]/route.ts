import { NextRequest, NextResponse } from "next/server";
import { getAccount } from "../../../../../lib/data";
import { formatVPF } from "../../../../../lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ platform: string; handle: string }> }
) {
  const { platform, handle } = await params;
  const account = getAccount(platform, handle);

  if (!account) {
    return new NextResponse("Not found", { status: 404 });
  }

  const vpf = formatVPF(account.valuePerFan);
  const rank = `#${account.rank.vpf}`;
  const label = "ValuePerFan";

  // Calculate widths based on text
  const labelWidth = label.length * 7.5 + 16;
  const vpfText = `${vpf}/fan`;
  const vpfWidth = vpfText.length * 7 + 16;
  const rankWidth = rank.length * 7.5 + 16;
  const totalWidth = labelWidth + vpfWidth + rankWidth;
  const height = 28;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="${(labelWidth / totalWidth) * 100}%" stop-color="#059669"/>
      <stop offset="${(labelWidth / totalWidth) * 100}%" stop-color="#374151"/>
      <stop offset="${((labelWidth + vpfWidth) / totalWidth) * 100}%" stop-color="#374151"/>
      <stop offset="${((labelWidth + vpfWidth) / totalWidth) * 100}%" stop-color="#1f2937"/>
      <stop offset="100%" stop-color="#1f2937"/>
    </linearGradient>
  </defs>
  <rect width="${totalWidth}" height="${height}" rx="4" fill="url(#bg)"/>
  <text x="${labelWidth / 2}" y="${height / 2 + 1}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="white">${label}</text>
  <text x="${labelWidth + vpfWidth / 2}" y="${height / 2 + 1}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="white">${vpfText}</text>
  <text x="${labelWidth + vpfWidth + rankWidth / 2}" y="${height / 2 + 1}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#9ca3af">${rank}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

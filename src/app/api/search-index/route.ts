import { NextResponse } from "next/server";
import searchIndex from "../../../data/search-index.json";

export async function GET() {
  return NextResponse.json(searchIndex, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

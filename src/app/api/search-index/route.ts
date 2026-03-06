import { NextResponse } from "next/server";
import searchIndex from "../../../data/search-index.json";
import { CACHE_SEARCH_INDEX } from "../../../lib/config";

export async function GET() {
  return NextResponse.json(searchIndex, {
    headers: {
      "Cache-Control": CACHE_SEARCH_INDEX,
    },
  });
}

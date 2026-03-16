import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/navigation";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // 301 redirect www → non-www
  if (request.headers.get("host")?.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = url.host.replace(/^www\./, "");
    return NextResponse.redirect(url, 301);
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|images|favicon\\.ico|favicon\\.svg|.*\\..*).*)",
  ],
};

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, hostname } = req.nextUrl;

  // Only gate wizard routes; allow everything else
  if (!pathname.startsWith("/wizard")) return NextResponse.next();

  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]";
  const wizardOpen = process.env.NEXT_PUBLIC_WIZARD_OPEN === "true";
  const allow = isLocal || wizardOpen || process.env.NODE_ENV !== "production";

  if (!allow) {
    const url = req.nextUrl.clone();
    url.pathname = "/wizard-info";
    url.search = "";
    return NextResponse.redirect(url, 302);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/wizard/:path*"],
};

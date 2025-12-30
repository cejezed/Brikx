import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Check if we should gate this route
  const isWizardRoute = pathname.startsWith("/wizard");
  const isWelcomeRoute = pathname.startsWith("/welcome");

  if (!isWizardRoute && !isWelcomeRoute) return NextResponse.next();

  // Test mode access
  const hasTestParam = searchParams.get('test') === 'true';
  const hasTestCookie = req.cookies.get('brikx_test_access')?.value === 'true';

  if (hasTestParam || hasTestCookie) {
    const response = NextResponse.next();
    if (hasTestParam && !hasTestCookie) {
      response.cookies.set('brikx_test_access', 'true', { maxAge: 60 * 60 * 24 * 7 }); // 1 week
    }
    return response;
  }

  // Redirect to maintenance page
  const url = req.nextUrl.clone();
  url.pathname = "/onderhoud";
  url.search = "";
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ["/wizard/:path*", "/welcome/:path*"],
};

import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);

  // Protect admin routes and API routes
  if (
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/api/admin")
  ) {
    if (!user) {
      if (request.nextUrl.pathname.startsWith("/api/admin")) {
        return new NextResponse("Unauthorized", { status: 401 });
      } else {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("reason", "no_session");
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images/).*)",
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images/|monitoring).*)",
  ],
};

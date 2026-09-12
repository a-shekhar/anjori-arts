import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

async function handleSignOut(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const nextParam = searchParams.get("next") ?? "/login";

  // Only allow relative redirects to prevent open-redirect vulnerabilities
  const destinationPath =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/login";

  // 1. Invalidate session on Supabase server with global scope
  try {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "global" });
  } catch (err) {
    console.warn("[auth/signout] Supabase global signOut error:", err);
  }

  // 2. Clear all Supabase cookies from the Next.js cookie store
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    for (const c of allCookies) {
      if (
        c.name.startsWith("sb-") ||
        c.name.includes("supabase") ||
        c.name.includes("auth-token")
      ) {
        cookieStore.delete(c.name);
        cookieStore.set(c.name, "", {
          path: "/",
          maxAge: 0,
          expires: new Date(0),
          sameSite: "lax",
          httpOnly: false,
        });
      }
    }
  } catch (err) {
    console.warn("[auth/signout] cookieStore delete error:", err);
  }

  const redirectUrl = new URL(destinationPath, request.url);
  const response = NextResponse.redirect(redirectUrl, { status: 302 });

  // 3. Guarantee cookie deletion headers are explicitly set on the HTTP 302 response
  try {
    for (const c of request.cookies.getAll()) {
      if (
        c.name.startsWith("sb-") ||
        c.name.includes("supabase") ||
        c.name.includes("auth-token")
      ) {
        response.cookies.set(c.name, "", {
          path: "/",
          maxAge: 0,
          expires: new Date(0),
          sameSite: "lax",
          httpOnly: false,
        });
      }
    }
  } catch (err) {
    console.warn("[auth/signout] response.cookies set error:", err);
  }

  return response;
}

export async function GET(request: NextRequest) {
  return handleSignOut(request);
}

export async function POST(request: NextRequest) {
  return handleSignOut(request);
}


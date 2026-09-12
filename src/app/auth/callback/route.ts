import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/account";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  const getRedirectUrl = (path: string) => {
    if (isLocalEnv) {
      return `${origin}${path}`;
    } else if (forwardedHost) {
      return `https://${forwardedHost}${path}`;
    } else {
      return `${origin}${path}`;
    }
  };

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    if (!error) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { createAdminClient } = await import("@/lib/supabase/admin");
          const adminClient = createAdminClient();
          await adminClient
            .from("profiles")
            .insert({ id: user.id, role: "USER" })
            .select()
            .maybeSingle();
        }
      } catch {
        // Profile already created or trigger handled it
      }
      return NextResponse.redirect(getRedirectUrl(next));
    }

    console.error("[auth/callback] Error verifying OTP token_hash:", error);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { createAdminClient } = await import("@/lib/supabase/admin");
          const adminClient = createAdminClient();
          await adminClient
            .from("profiles")
            .insert({ id: user.id, role: "USER" })
            .select()
            .maybeSingle();
        }
      } catch {
        // Profile already created or trigger handled it
      }
      return NextResponse.redirect(getRedirectUrl(next));
    }

    console.error("[auth/callback] Error exchanging code for session:", error);
  }

  return NextResponse.redirect(getRedirectUrl("/login?error=auth_callback_failed"));
}


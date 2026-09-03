import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function verifyAdminRole() {
  try {
    // 1. Verify user identity cryptographically from the browser session cookies
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { authorized: false, error: "Unauthorized" };
    }

    // 2. Read role using service role client to prevent RLS recursion/policy blockage
    const adminDb = createAdminClient();
    const { data: profile, error: profileError } = await adminDb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[verifyAdminRole] Error fetching profile:", profileError);
      return { authorized: false, error: "Internal Server Error" };
    }

    if (profile?.role !== "ADMIN") {
      console.warn("[verifyAdminRole] Forbidden: user", user.email, "role is", profile?.role);
      return { authorized: false, error: "Forbidden", role: profile?.role };
    }

    return { authorized: true, user };
  } catch (error) {
    console.error("[verifyAdminRole] Unexpected error:", error);
    return { authorized: false, error: "Internal Server Error" };
  }
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Mail, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/account/SignOutButton";
import { AccountNav } from "@/components/account/AccountNav";

export const metadata: Metadata = {
  title: "Collector Account | Anjori Arts",
  description: "Manage your collector profile, art acquisitions, delivery coordinates, and security.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  // Fetch profile role
  let role = "USER";
  try {
    const adminDb = createAdminClient();
    const { data: profile } = await adminDb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role) {
      role = profile.role;
    }
  } catch (e) {
    console.error("[AccountLayout] Error fetching role:", e);
  }

  const firstName = user.user_metadata?.first_name || "";
  const lastName = user.user_metadata?.last_name || "";
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Art Collector";

  const memberSince = new Date(user.created_at).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <section className="border-b border-border bg-muted/30 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="aa-eyebrow inline-block mb-1">Collector Portal</span>
              <h1 className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
                Namaste, {firstName || fullName}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Manage your art acquisitions, personal coordinates, and preferences.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {role === "ADMIN" && (
                <Link href="/admin">
                  <Button className="rounded-xl shadow-sm gap-2 h-10 text-xs">
                    <ShieldCheck className="size-4" />
                    <span>Admin Portal</span>
                  </Button>
                </Link>
              )}
              <SignOutButton className="rounded-xl h-10 text-xs" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
          {/* Left Sidebar */}
          <aside className="space-y-6">
            {/* Collector Mini Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 font-serif text-xl font-bold text-primary shrink-0">
                  {fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="font-serif text-base font-semibold text-foreground truncate">
                    {fullName}
                  </h2>
                  <div className="mt-1 flex items-center gap-2">
                    {role === "ADMIN" ? (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                        Administrator
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Collector Member
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2.5 truncate">
                  <Mail className="size-3.5 shrink-0 text-muted-foreground/70" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="size-3.5 shrink-0 text-muted-foreground/70" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>
            </div>

            {/* Navigation (Pills on Mobile, Sidebar on Desktop) */}
            <AccountNav />
          </aside>

          {/* Right Main Panel */}
          <div className="min-w-0">{children}</div>
        </div>
      </main>
    </div>
  );
}


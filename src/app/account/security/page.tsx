import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SecurityForms } from "@/components/account/SecurityForms";

export const metadata: Metadata = {
  title: "Security & Settings | Anjori Arts",
  description: "Manage your collector account password, active sessions, and privacy.",
};

export default async function AccountSecurityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account/security");
  }

  const isOAuthUser =
    user.app_metadata?.provider === "google" ||
    (user.app_metadata?.providers &&
      Array.isArray(user.app_metadata.providers) &&
      user.app_metadata.providers.includes("google") &&
      !user.app_metadata.providers.includes("email"));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Shield className="size-4" />
          </div>
          <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground">
            Security & Account Settings
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your credentials, sign out from other devices, and configure account access.
        </p>
      </div>

      <SecurityForms isOAuthUser={Boolean(isOAuthUser)} />
    </div>
  );
}


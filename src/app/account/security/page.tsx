import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SecurityForms } from "@/components/account/SecurityForms";
import { AccountSubpageHeader } from "@/components/account/AccountSubpageHeader";

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
      <AccountSubpageHeader
        title="Security & Account Settings"
        description="Manage your credentials, sign out from other devices, and configure account access."
      />

      <SecurityForms isOAuthUser={Boolean(isOAuthUser)} />
    </div>
  );
}


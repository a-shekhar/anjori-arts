"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { performSignOut } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SignOutButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await performSignOut({ redirectTo: "/login" });
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleLogout}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin mr-2" />
      ) : (
        <LogOut className="size-4 mr-2" />
      )}
      <span>{loading ? "Signing out..." : "Sign Out"}</span>
    </Button>
  );
}


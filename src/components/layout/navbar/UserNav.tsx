"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { User, LogOut, Package, ShieldCheck, Heart, MapPin, Shield, Loader2 } from "lucide-react";
import { createClient, performSignOut, subscribeToAuthSync } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfileState {
  id: string;
  email?: string;
  fullName: string;
  initial: string;
  isAdmin: boolean;
}

export function UserNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = React.useState<UserProfileState | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !isMounted) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const meta = user.user_metadata || {};
        const fullName =
          [meta.first_name, meta.last_name].filter(Boolean).join(" ") ||
          meta.full_name ||
          user.email?.split("@")[0] ||
          "Collector";

        const initial = fullName.charAt(0).toUpperCase() || "A";

        // Check if admin
        let isAdmin = false;
        try {
          const { data: profileRow } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

          if (profileRow?.role === "ADMIN") {
            isAdmin = true;
          }
        } catch {
          // default false
        }

        if (isMounted) {
          setProfile({
            id: user.id,
            email: user.email,
            fullName,
            initial,
            isAdmin,
          });
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
      }
    }

    loadUser();

    // Cross-tab broadcast listener
    const unsubscribeSync = subscribeToAuthSync(() => {
      if (isMounted) {
        setProfile(null);
        setLoading(false);
      }
      if (
        typeof window !== "undefined" &&
        (window.location.pathname.startsWith("/account") ||
          window.location.pathname.startsWith("/admin"))
      ) {
        window.location.replace("/login?reason=no_session");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
        if (typeof window !== "undefined" && window.location.pathname.startsWith("/account")) {
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = "/login?reason=no_session";
        }
      } else {
        loadUser();
      }
    });

    return () => {
      isMounted = false;
      unsubscribeSync();
      subscription.unsubscribe();
    };
  }, [pathname]);

  if (loading) {
    return (
      <div className="inline-flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-muted-foreground">
        <div className="size-4 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Link
        href="/login"
        className="inline-flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer active:scale-95"
        aria-label="Sign in to your account"
        title="Sign in"
      >
        <User className="size-5" />
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer active:scale-95"
        aria-label="Open collector account menu"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-xs font-serif font-bold text-primary ring-1 ring-primary/30">
          {profile.initial}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-lg">
        <DropdownMenuLabel className="font-normal px-2.5 py-2">
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-medium leading-none text-foreground truncate">{profile.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{profile.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/account")}
          className="flex items-center gap-2 cursor-pointer py-2 rounded-xl"
        >
          <User className="size-4" />
          <span>Personal Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/account/orders")}
          className="flex items-center gap-2 cursor-pointer py-2 rounded-xl"
        >
          <Package className="size-4" />
          <span>My Orders</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/account/addresses")}
          className="flex items-center gap-2 cursor-pointer py-2 rounded-xl"
        >
          <MapPin className="size-4" />
          <span>Saved Addresses</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/account/wishlist")}
          className="flex items-center gap-2 cursor-pointer py-2 rounded-xl"
        >
          <Heart className="size-4 text-rose-500" />
          <span>Collector Wishlist</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/account/security")}
          className="flex items-center gap-2 cursor-pointer py-2 rounded-xl"
        >
          <Shield className="size-4" />
          <span>Security & Settings</span>
        </DropdownMenuItem>
        {profile.isAdmin && (
          <DropdownMenuItem
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 cursor-pointer py-2 rounded-xl"
          >
            <ShieldCheck className="size-4 text-primary" />
            <span>Admin Dashboard</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isLoggingOut}
          onClick={async () => {
            setIsLoggingOut(true);
            setProfile(null);
            await performSignOut({ redirectTo: "/login" });
          }}
          className="flex items-center gap-2 cursor-pointer py-2 rounded-xl"
        >
          {isLoggingOut ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


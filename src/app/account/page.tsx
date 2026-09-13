import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  User,
  Package,
  MapPin,
  Heart,
  Shield,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserOrders } from "@/actions/orders";
import { getUserAddresses } from "@/actions/account";
import { ProfileForm } from "@/components/account/ProfileForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/account/SignOutButton";

export const metadata: Metadata = {
  title: "Personal Profile | Anjori Arts",
  description: "Update your collector profile, contact coordinates, and preferences.",
};

export default async function AccountProfilePage() {
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
    console.error("[AccountProfilePage] Error fetching role:", e);
  }

  // Fetch quick metrics for the overview
  const orders = await getUserOrders();
  const addresses = await getUserAddresses();

  const firstName = user.user_metadata?.first_name || "";
  const lastName = user.user_metadata?.last_name || "";
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Art Collector";

  const countryCode = user.user_metadata?.country_code || "+91";
  let phone = user.user_metadata?.phone || "";
  if (phone.startsWith(countryCode)) {
    phone = phone.slice(countryCode.length);
  }

  const isOAuthUser =
    user.app_metadata?.provider === "google" ||
    (user.app_metadata?.providers &&
      Array.isArray(user.app_metadata.providers) &&
      user.app_metadata.providers.includes("google") &&
      !user.app_metadata.providers.includes("email"));

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Mobile Collector Profile Hero (< lg) */}
      <div className="lg:hidden rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 font-serif text-xl font-bold text-primary shrink-0">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-lg font-semibold tracking-tight text-foreground truncate">
                Namaste, {firstName || fullName}
              </h1>
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
            <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-border/70 pt-3">
          {role === "ADMIN" && (
            <Link href="/admin" className="flex-1">
              <Button variant="outline" size="sm" className="w-full rounded-xl h-9 text-xs gap-1.5 font-medium">
                <ShieldCheck className="size-3.5 text-primary" />
                <span>Admin Portal</span>
              </Button>
            </Link>
          )}
          <div className={role === "ADMIN" ? "flex-1" : "w-full"}>
            <SignOutButton className="w-full rounded-xl h-9 text-xs" />
          </div>
        </div>
      </div>

      {/* Mobile Account Navigation Menu List (< lg) */}
      <div className="lg:hidden rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden shadow-xs">
        <Link
          href="/account/orders"
          className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50 active:bg-muted"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Package className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">My Orders & Acquisitions</p>
              <p className="text-xs text-muted-foreground truncate">Track delivery & bespoke orders</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
              {orders.length}
            </Badge>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </Link>

        <Link
          href="/account/addresses"
          className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50 active:bg-muted"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <MapPin className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Saved Delivery Addresses</p>
              <p className="text-xs text-muted-foreground truncate">{addresses.length} of 5 saved destinations</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </Link>

        <Link
          href="/account/wishlist"
          className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50 active:bg-muted"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Heart className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Collector Wishlist</p>
              <p className="text-xs text-muted-foreground truncate">Saved artworks & pieces</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </Link>

        <Link
          href="/account/security"
          className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50 active:bg-muted"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Shield className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Security & Settings</p>
              <p className="text-xs text-muted-foreground truncate">Password, sessions & privacy</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </Link>
      </div>

      {/* Desktop Quick Overview Summary Cards (Desktop Only) */}
      <div className="hidden lg:grid grid-cols-2 gap-4">
        <Link
          href="/account/orders"
          className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Acquisitions & Orders</p>
              <p className="font-serif text-xl font-bold text-foreground">
                {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </p>
            </div>
          </div>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </Link>

        <Link
          href="/account/addresses"
          className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saved Delivery Addresses</p>
              <p className="font-serif text-xl font-bold text-foreground">
                {addresses.length} of 5 Saved
              </p>
            </div>
          </div>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </Link>
      </div>

      {/* Personal Information Form */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-8 shadow-sm">
        <div className="border-b border-border pb-4 sm:pb-5 mb-5 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <User className="size-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-medium tracking-tight text-foreground">
                Personal Information
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update your contact details and name for orders and personalized invoices.
              </p>
            </div>
          </div>
        </div>

        <ProfileForm
          isOAuthUser={Boolean(isOAuthUser)}
          initialData={{
            firstName,
            lastName,
            email: user.email || "",
            phone,
            countryCode,
          }}
        />
      </section>
    </div>
  );
}

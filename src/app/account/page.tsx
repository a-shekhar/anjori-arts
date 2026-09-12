import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Package, MapPin, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserOrders } from "@/actions/orders";
import { getUserAddresses } from "@/actions/account";
import { ProfileForm } from "@/components/account/ProfileForm";

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

  // Fetch quick metrics for the overview
  const orders = await getUserOrders();
  const addresses = await getUserAddresses();

  const firstName = user.user_metadata?.first_name || "";
  const lastName = user.user_metadata?.last_name || "";
  const countryCode = user.user_metadata?.country_code || "+91";
  let phone = user.user_metadata?.phone || "";
  // Strip leading country code if present in phone string for clean form display
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
    <div className="space-y-8">
      {/* Quick Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="border-b border-border pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <User className="size-4" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-medium tracking-tight text-foreground">
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

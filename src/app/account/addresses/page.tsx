import type { Metadata } from "next";
import { MapPin, Plus } from "lucide-react";
import { getUserAddresses } from "@/actions/account";
import { MAX_ADDRESSES } from "@/config/constants";
import { AddressCard } from "@/components/account/AddressCard";
import { AddressModal } from "@/components/account/AddressModal";
import { AccountSubpageHeader } from "@/components/account/AccountSubpageHeader";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Saved Addresses | Anjori Arts",
  description: "Manage your delivery addresses and set a default shipping destination.",
};

export default async function AccountAddressesPage() {
  const addresses = await getUserAddresses();
  const maxReached = addresses.length >= MAX_ADDRESSES;

  return (
    <div className="space-y-6">
      <AccountSubpageHeader
        title="Saved Delivery Addresses"
        description="Manage your personal and gifting shipping addresses for fast 1-click checkout."
        badge={
          <span className="text-xs font-medium text-muted-foreground ml-1">
            ({addresses.length}/{MAX_ADDRESSES} saved)
          </span>
        }
        action={
          <AddressModal
            disabled={maxReached}
            trigger={
              <Button
                disabled={maxReached}
                className="w-full sm:w-auto rounded-xl gap-2 shadow-sm font-medium min-h-[44px] h-10 text-xs sm:text-sm"
              >
                <Plus className="size-3.5" />
                <span>Add Address</span>
              </Button>
            }
          />
        }
      />

      {maxReached && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300">
          You have reached the maximum of {MAX_ADDRESSES} saved addresses. To add a new one, please edit or delete an existing address.
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 sm:p-12 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
            <MapPin className="size-7" />
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-medium text-foreground">
            No saved delivery addresses yet
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Save your home, studio, or gifting addresses now to enjoy streamlined checkout for your
            future handcrafted art acquisitions.
          </p>
          <div className="mt-6">
            <AddressModal
              trigger={
                <Button className="rounded-xl font-medium gap-2 shadow-sm min-h-[44px] h-11 text-xs sm:text-sm">
                  <Plus className="size-4" />
                  <span>Add First Delivery Address</span>
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <AddressCard key={addr.id} address={addr} />
          ))}
        </div>
      )}
    </div>
  );
}


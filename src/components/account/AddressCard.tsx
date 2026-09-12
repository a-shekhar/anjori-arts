"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Briefcase,
  Building,
  Phone,
  CheckCircle2,
  Trash2,
  Edit2,
  Loader2,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { deleteAddress, setDefaultAddress } from "@/actions/account";
import type { UserAddress } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddressModal } from "@/components/account/AddressModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AddressCardProps {
  address: UserAddress;
}

export function AddressCard({ address }: AddressCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function getTypeIcon(type: string) {
    switch (type) {
      case "work":
        return <Briefcase className="size-3.5 text-primary" />;
      case "other":
        return <Building className="size-3.5 text-primary" />;
      case "home":
      default:
        return <Home className="size-3.5 text-primary" />;
    }
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case "work":
        return "Work / Studio";
      case "other":
        return "Other";
      case "home":
      default:
        return "Home";
    }
  }

  async function handleSetDefault() {
    if (address.is_default || loading) return;
    setLoading(true);
    try {
      const res = await setDefaultAddress(address.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Default delivery address updated");
        router.refresh();
      }
    } catch {
      toast.error("Failed to update default address");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await deleteAddress(address.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Delivery address removed");
        setShowDeleteConfirm(false);
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete address");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div
        className={`relative flex flex-col justify-between rounded-2xl border p-5 sm:p-6 transition-all shadow-sm ${
          address.is_default
            ? "border-primary/40 bg-card ring-1 ring-primary/20"
            : "border-border bg-card hover:border-border/80"
        }`}
      >
        <div className="space-y-3">
          {/* Header row: type badge + default badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
              {getTypeIcon(address.address_type)}
              <span>{getTypeLabel(address.address_type)}</span>
            </div>

            {address.is_default ? (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px] font-medium gap-1">
                <CheckCircle2 className="size-3" />
                <span>Default Address</span>
              </Badge>
            ) : (
              <button
                type="button"
                onClick={handleSetDefault}
                disabled={loading}
                className="text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <Star className="size-3" />
                <span>Set as Default</span>
              </button>
            )}
          </div>

          {/* Recipient & Phone */}
          <div>
            <h3 className="font-serif text-base font-semibold text-foreground">
              {address.recipient_name}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="size-3.5 shrink-0" />
              <span>{address.phone}</span>
            </div>
          </div>

          {/* Formatted Address */}
          <div className="text-xs text-muted-foreground leading-relaxed pt-1 space-y-0.5">
            <p className="text-foreground/90 font-medium">{address.street}</p>
            {address.landmark && <p>Landmark: {address.landmark}</p>}
            <p>
              {address.city}, {address.state} —{" "}
              <span className="font-mono font-medium text-foreground">{address.pincode}</span>
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-4">
          <AddressModal
            initialAddress={address}
            trigger={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs gap-1.5 font-normal"
              >
                <Edit2 className="size-3" />
                <span>Edit</span>
              </Button>
            }
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="h-8 rounded-lg text-xs gap-1.5 font-normal text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-3" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-serif text-lg font-medium text-foreground">
              Delete Delivery Address?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to remove this saved address for{" "}
              <strong className="text-foreground">{address.recipient_name}</strong> ({address.city})?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={loading}
              className="rounded-xl text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="rounded-xl text-xs h-9 font-medium gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="size-3" />
                  <span>Delete Address</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Building, Home, Briefcase, Plus } from "lucide-react";
import { toast } from "sonner";
import { saveAddress } from "@/actions/account";
import type { UserAddress, AddressType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface AddressModalProps {
  initialAddress?: UserAddress | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

function AddressFormContent({
  initialAddress,
  onSuccess,
  onCancel,
}: {
  initialAddress?: UserAddress | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [recipientName, setRecipientName] = useState(initialAddress?.recipient_name || "");
  const [phone, setPhone] = useState(initialAddress?.phone || "");
  const [street, setStreet] = useState(initialAddress?.street || "");
  const [landmark, setLandmark] = useState(initialAddress?.landmark || "");
  const [city, setCity] = useState(initialAddress?.city || "");
  const [state, setState] = useState(initialAddress?.state || "");
  const [pincode, setPincode] = useState(initialAddress?.pincode || "");
  const [addressType, setAddressType] = useState<AddressType>(initialAddress?.address_type || "home");
  const [isDefault, setIsDefault] = useState(initialAddress?.is_default || false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("recipient_name", recipientName);
      formData.append("phone", phone);
      formData.append("street", street);
      formData.append("landmark", landmark);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("pincode", pincode);
      formData.append("address_type", addressType);
      if (isDefault) {
        formData.append("is_default", "true");
      }

      const result = await saveAddress(formData, initialAddress?.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          initialAddress
            ? "Delivery address updated successfully"
            : "New delivery address added successfully"
        );
        onSuccess();
      }
    } catch {
      toast.error("Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {/* Address Type Selector */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">Address Label</Label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setAddressType("home")}
            className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-colors cursor-pointer ${
              addressType === "home"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Home className="size-3.5" />
            <span>Home</span>
          </button>
          <button
            type="button"
            onClick={() => setAddressType("work")}
            className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-colors cursor-pointer ${
              addressType === "work"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Briefcase className="size-3.5" />
            <span>Work / Studio</span>
          </button>
          <button
            type="button"
            onClick={() => setAddressType("other")}
            className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-colors cursor-pointer ${
              addressType === "other"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Building className="size-3.5" />
            <span>Other / Gift</span>
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Recipient Name */}
        <div className="space-y-1">
          <Label htmlFor="recipientName" className="text-xs font-medium text-foreground">
            Recipient Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="recipientName"
            type="text"
            required
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="e.g. Aditi Sharma"
            className="rounded-xl h-10 text-sm"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <Label htmlFor="addressPhone" className="text-xs font-medium text-foreground">
            Delivery Contact Phone <span className="text-destructive">*</span>
          </Label>
          <Input
            id="addressPhone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile"
            className="rounded-xl h-10 text-sm"
          />
        </div>
      </div>

      {/* Street Address */}
      <div className="space-y-1">
        <Label htmlFor="street" className="text-xs font-medium text-foreground">
          Flat, House No., Building, Apartment & Street <span className="text-destructive">*</span>
        </Label>
        <Input
          id="street"
          type="text"
          required
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="e.g. Flat 402, Lotus Tower, 14th Main"
          className="rounded-xl h-10 text-sm"
        />
      </div>

      {/* Landmark */}
      <div className="space-y-1">
        <Label htmlFor="landmark" className="text-xs font-medium text-foreground">
          Landmark <span className="text-muted-foreground text-[11px]">(Optional)</span>
        </Label>
        <Input
          id="landmark"
          type="text"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          placeholder="e.g. Near St. Mary Church"
          className="rounded-xl h-10 text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* City */}
        <div className="space-y-1">
          <Label htmlFor="city" className="text-xs font-medium text-foreground">
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Patna"
            className="rounded-xl h-10 text-sm"
          />
        </div>

        {/* State */}
        <div className="space-y-1">
          <Label htmlFor="state" className="text-xs font-medium text-foreground">
            State <span className="text-destructive">*</span>
          </Label>
          <Input
            id="state"
            type="text"
            required
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g. Bihar"
            className="rounded-xl h-10 text-sm"
          />
        </div>

        {/* PIN Code */}
        <div className="space-y-1">
          <Label htmlFor="pincode" className="text-xs font-medium text-foreground">
            PIN Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="pincode"
            type="text"
            required
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6 digits"
            className="rounded-xl h-10 text-sm"
          />
        </div>
      </div>

      {/* Make Default Checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <Checkbox
          id="isDefault"
          checked={isDefault}
          onCheckedChange={(checked) => setIsDefault(Boolean(checked))}
        />
        <Label htmlFor="isDefault" className="text-xs font-normal text-muted-foreground cursor-pointer">
          Set as default delivery address for future acquisitions
        </Label>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl text-xs h-10"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="rounded-xl text-xs h-10 min-w-[120px] font-medium shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="size-3.5 animate-spin mr-1.5" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{initialAddress ? "Update Address" : "Save Address"}</span>
          )}
        </Button>
      </div>
    </form>
  );
}

export function AddressModal({
  initialAddress,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  disabled = false,
}: AddressModalProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={<>{trigger}</>} />
      ) : (
        <DialogTrigger
          render={
            <Button
              disabled={disabled}
              className="rounded-xl gap-2 shadow-sm font-medium h-11"
            >
              <Plus className="size-4" />
              <span>Add New Address</span>
            </Button>
          }
        />
      )}

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="font-serif text-xl font-medium text-foreground flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            <span>{initialAddress ? "Edit Delivery Address" : "Add Delivery Address"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Save shipping coordinates for safe courier dispatch of your authentic handcrafted art pieces.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <AddressFormContent
            key={initialAddress?.id || "new-address"}
            initialAddress={initialAddress}
            onSuccess={() => {
              setOpen(false);
              router.refresh();
            }}
            onCancel={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}


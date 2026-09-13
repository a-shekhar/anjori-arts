"use client";

import { useState, useRef, useEffect, isValidElement, cloneElement } from "react";
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

  // PIN lookup helper state
  const [pinLoading, setPinLoading] = useState(false);
  const [pinDetectedInfo, setPinDetectedInfo] = useState<string | null>(
    initialAddress ? `${initialAddress.city}, ${initialAddress.state}` : null
  );
  const [pinNotFound, setPinNotFound] = useState(false);
  const pinAbortControllerRef = useRef<AbortController | null>(null);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (pinAbortControllerRef.current) {
        pinAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Indian Pincode Auto-Lookup (with race-condition cancellation & timeout)
  const handlePincodeChange = async (val: string) => {
    if (pinAbortControllerRef.current) {
      pinAbortControllerRef.current.abort();
      pinAbortControllerRef.current = null;
    }

    const clean = val.replace(/\D/g, "").slice(0, 6);
    setPincode(clean);
    setPinNotFound(false);

    if (clean.length === 6) {
      setPinLoading(true);
      const controller = new AbortController();
      pinAbortControllerRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            const detectedCity = po.District || po.Block || po.Name;
            const detectedState = po.State;
            setCity(detectedCity);
            setState(detectedState);
            setPinDetectedInfo(`${detectedCity}, ${detectedState}`);
            setPinNotFound(false);
            toast.success(`Location detected: ${detectedCity}, ${detectedState}`);
          } else {
            setPinDetectedInfo(null);
            setPinNotFound(true);
          }
        } else {
          setPinDetectedInfo(null);
          setPinNotFound(true);
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          setPinDetectedInfo(null);
        }
      } finally {
        if (pinAbortControllerRef.current === controller) {
          setPinLoading(false);
          pinAbortControllerRef.current = null;
        }
      }
    } else {
      setPinDetectedInfo(null);
      setPinNotFound(false);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) {
      toast.error("Please enter a valid 6-digit Indian PIN code");
      return;
    }

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
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setAddressType("home")}
            className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border p-2 text-[11px] sm:text-xs font-medium transition-colors cursor-pointer text-center ${
              addressType === "home"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Home className="size-3.5 shrink-0" />
            <span>Home</span>
          </button>
          <button
            type="button"
            onClick={() => setAddressType("work")}
            className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border p-2 text-[11px] sm:text-xs font-medium transition-colors cursor-pointer text-center ${
              addressType === "work"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Briefcase className="size-3.5 shrink-0" />
            <span>Work<span className="hidden sm:inline"> / Studio</span></span>
          </button>
          <button
            type="button"
            onClick={() => setAddressType("other")}
            className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border p-2 text-[11px] sm:text-xs font-medium transition-colors cursor-pointer text-center ${
              addressType === "other"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Building className="size-3.5 shrink-0" />
            <span>Other<span className="hidden sm:inline"> / Gift</span></span>
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
            className="rounded-xl min-h-[44px] h-11 text-sm"
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
            className="rounded-xl min-h-[44px] h-11 text-sm"
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
          className="rounded-xl min-h-[44px] h-11 text-sm"
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
          className="rounded-xl min-h-[44px] h-11 text-sm"
        />
      </div>

      {/* PIN Code, City & State Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* PIN Code */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="pincode" className="text-xs font-medium text-foreground">
              PIN Code <span className="text-destructive">*</span>
            </Label>
            {pinLoading && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                Detecting...
              </span>
            )}
          </div>
          <Input
            id="pincode"
            type="text"
            required
            maxLength={6}
            value={pincode}
            onChange={(e) => handlePincodeChange(e.target.value)}
            placeholder="e.g. 605001"
            className="rounded-xl min-h-[44px] h-11 text-sm font-mono"
          />
          {pinDetectedInfo && (
            <span className="block text-[11px] font-medium text-emerald-600 dark:text-emerald-400 truncate">
              ✓ {pinDetectedInfo}
            </span>
          )}
          {pinNotFound && !pinLoading && (
            <span className="block text-[11px] text-amber-600 dark:text-amber-400">
              PIN not found in postal directory. Please enter City &amp; State manually.
            </span>
          )}
        </div>

        {/* City */}
        <div className="space-y-1">
          <Label htmlFor="city" className="text-xs font-medium text-foreground">
            City / District <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Puducherry"
            className="rounded-xl min-h-[44px] h-11 text-sm"
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
            placeholder="e.g. Puducherry"
            className="rounded-xl min-h-[44px] h-11 text-sm"
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
      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 sm:flex-initial rounded-xl text-xs sm:text-sm min-h-[44px] h-11 px-4"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 sm:flex-initial rounded-xl text-xs sm:text-sm min-h-[44px] h-11 px-5 sm:min-w-[120px] font-medium shadow-sm"
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
    <>
      {isValidElement(trigger) ? (
        cloneElement(trigger as React.ReactElement<{ onClick?: React.MouseEventHandler; disabled?: boolean }>, {
          onClick: (e: React.MouseEvent) => {
            if (disabled) return;
            (trigger.props as { onClick?: React.MouseEventHandler }).onClick?.(e);
            setOpen(true);
          },
          disabled: disabled || (trigger.props as { disabled?: boolean }).disabled,
        })
      ) : trigger ? (
        <span
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!disabled) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (!disabled && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              setOpen(true);
            }
          }}
          className="inline-block cursor-pointer"
        >
          {trigger}
        </span>
      ) : (
        <Button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className="rounded-xl gap-2 shadow-sm font-medium min-h-[44px] h-11 text-xs sm:text-sm"
        >
          <Plus className="size-4" />
          <span>Add New Address</span>
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-1.5rem)] sm:w-full sm:max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl p-4 sm:p-6 mx-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-serif text-lg sm:text-xl font-medium text-foreground flex items-center gap-2">
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
    </>
  );
}


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Lock, User, Phone, Mail, Info } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountryCodeSelect } from "@/components/ui/country-code-select";

interface ProfileFormProps {
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    countryCode: string;
  };
  isOAuthUser?: boolean;
}

export function ProfileForm({ initialData, isOAuthUser = false }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState(initialData.firstName);
  const [lastName, setLastName] = useState(initialData.lastName);
  const [email, setEmail] = useState(initialData.email);
  const [phone, setPhone] = useState(initialData.phone);
  const [countryCode, setCountryCode] = useState(initialData.countryCode || "+91");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("countryCode", countryCode);
      formData.append("phone", phone);
      if (!isOAuthUser) {
        formData.append("email", email);
      }

      const result = await updateProfile(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        if (result.emailVerificationSent) {
          setPendingEmail(result.newEmail || email);
          toast.success("Profile updated! Confirmation email sent.", {
            description: `A verification link was sent to ${result.newEmail || email}.`,
          });
        } else {
          toast.success("Profile updated successfully!");
        }
        router.refresh();
      }
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {pendingEmail && (
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-xs text-blue-900 dark:text-blue-200 space-y-1">
          <div className="flex items-center gap-2 font-semibold">
            <Info className="size-4 text-blue-600 dark:text-blue-400" />
            <span>Email Verification Pending</span>
          </div>
          <p className="leading-relaxed pl-6">
            We sent a verification link to <strong className="font-mono">{pendingEmail}</strong>.
            Please click the link in your email to finalize the change. Your current email remains
            active for signing in until verified.
          </p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-xs font-medium text-foreground">
            First Name <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Radhika"
              className="pl-10 h-11 rounded-xl"
            />
          </div>
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-xs font-medium text-foreground">
            Last Name
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Sharma"
              className="pl-10 h-11 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="email" className="text-xs font-medium text-foreground">
            Email Address <span className="text-destructive">*</span>
          </Label>
          {isOAuthUser ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Lock className="size-3" />
              <span>Google Account</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-primary">
              <CheckCircle2 className="size-3" />
              <span>Editable (Requires Email Verification)</span>
            </span>
          )}
        </div>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            required
            disabled={isOAuthUser}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`pl-10 h-11 rounded-xl ${
              isOAuthUser
                ? "bg-muted/50 cursor-not-allowed opacity-90 text-foreground"
                : "text-foreground"
            }`}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          {isOAuthUser
            ? "Your email is synced from Google and cannot be modified directly here."
            : "Updating your email triggers a verification link sent to your new address."}
        </p>
      </div>

      {/* Phone Number with Country Code */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-xs font-medium text-foreground">
          Contact Phone Number
        </Label>
        <div className="flex gap-2">
          <div className="w-[105px] shrink-0">
            <CountryCodeSelect
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="rounded-xl h-11"
              aria-label="Country Code"
            />
          </div>
          <div className="relative flex-1">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile number"
              className="pl-10 h-11 rounded-xl"
            />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Used by couriers for live delivery coordinates and dispatch SMS alerts.
        </p>
      </div>

      <div className="flex items-center justify-end pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="h-11 min-w-[140px] rounded-xl font-medium gap-2 shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, MailCheck, AlertCircle } from "lucide-react";
import { signup } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SignupForm() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string) || "";
    setSubmittedEmail(email);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify and try again.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    const result = await signup(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result?.requiresVerification) {
      setVerificationRequired(true);
      setLoading(false);
      return;
    }

    if (result?.success) {
      // Immediate session created (email verification disabled)
      const destination = redirectUrl || "/account";
      window.location.href = destination;
    }
  }

  const loginLink = redirectUrl
    ? `/login?redirect=${encodeURIComponent(redirectUrl)}`
    : "/login";

  if (verificationRequired) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-background">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
            <MailCheck className="size-8" />
          </div>
          <span className="aa-eyebrow inline-block mb-2">Check Your Inbox</span>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Verify your email
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            We have sent a verification link to{" "}
            <span className="font-semibold text-foreground">{submittedEmail}</span>.
            Please click the link in your email to activate your Anjori Arts account.
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm text-left text-xs text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">Didn&apos;t receive the email?</p>
            <p>1. Check your spam or promotions folder.</p>
            <p>2. Verify you entered the correct address.</p>
          </div>

          <div className="mt-8">
            <Link href={loginLink}>
              <Button variant="outline" className="w-full h-11 rounded-xl">
                Return to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
          <div className="relative size-10 overflow-hidden rounded-full shadow-sm transition-transform duration-300 group-hover:scale-105">
            <Image src="/logo.jpg" alt="Anjori Arts" fill className="object-cover scale-150" sizes="40px" />
          </div>
          <span className="font-serif text-2xl font-semibold tracking-[-0.03em] text-foreground">
            Anjori Arts
          </span>
        </Link>
        <span className="aa-eyebrow inline-block mb-2">Join Anjori Arts</span>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Create an account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track handcrafted artwork orders and save commission requests
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">
              <AlertCircle className="size-5 shrink-0 text-destructive mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="firstName"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  First Name <span className="text-primary">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  placeholder="Priya"
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="lastName"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Sharma"
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Email Address <span className="text-primary">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="priya@example.com"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="phone"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Phone Number (Optional)
              </Label>
              <div className="flex gap-2">
                <span className="inline-flex h-10 items-center justify-center rounded-xl border border-input bg-muted/40 px-3 text-sm text-muted-foreground">
                  +91
                </span>
                <input type="hidden" name="countryCode" value="+91" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  className="h-10 rounded-xl flex-1"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Password <span className="text-primary">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="h-10 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Must include at least 8 characters with letters and numbers.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Confirm Password <span className="text-primary">*</span>
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="Re-enter password"
                className="h-10 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl font-medium shadow-sm transition-all gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={loginLink}
              className="font-medium text-primary hover:underline transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground text-center">
          <ShieldCheck className="size-4 text-muted-foreground/80" />
          <span>Your personal information is kept strictly confidential</span>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-background">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}


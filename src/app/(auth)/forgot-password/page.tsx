"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  ArrowRight,
  MailCheck,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  RotateCw,
} from "lucide-react";
import { forgotPassword, verifyRecoveryOtp } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
function getRemainingCooldown(key: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const expires = parseInt(raw, 10);
      const remaining = Math.ceil((expires - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
  } catch {
    // ignore
  }
  return 0;
}

function setCooldownExpiry(key: string, seconds = 60) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, String(Date.now() + seconds * 1000));
  } catch {
    // ignore
  }
}

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const emailParam = searchParams.get("email");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  // OTP Verification state
  const [otpToken, setOtpToken] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Resend Email state
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Cross-tab auto-redirect state
  const [verifiedRedirecting, setVerifiedRedirecting] = useState(false);

  // Restore remaining cooldown if user returns or refreshes
  useEffect(() => {
    if (!submittedEmail) return;
    const remaining = getRemainingCooldown(`forgot_cooldown_${submittedEmail}`);
    if (remaining > 0) {
      setCountdown(remaining);
    }
  }, [submittedEmail]);

  // Listen for recovery click / authentication from another device, tab, or window
  useEffect(() => {
    if (!submittedEmail) return;

    const supabase = createClient();

    const handleSessionDetected = () => {
      setVerifiedRedirecting(true);
      setTimeout(() => {
        window.location.href = "/reset-password";
      }, 600);
    };

    // 1. Cross-tab auth state change listener (BroadcastChannel)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        session?.user &&
        (event === "PASSWORD_RECOVERY" ||
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED")
      ) {
        handleSessionDetected();
      }
    });

    // 2. Window focus & visibility change listener (fires when user switches back to this tab)
    const checkVerificationStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          handleSessionDetected();
        }
      } catch {
        // ignore
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkVerificationStatus();
      }
    };

    window.addEventListener("focus", checkVerificationStatus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 3. Periodic polling interval every 2.5 seconds while waiting
    const pollInterval = setInterval(checkVerificationStatus, 2500);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("focus", checkVerificationStatus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(pollInterval);
    };
  }, [submittedEmail]);

  // Resend countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string) || "";
    const cleanEmail = email.trim().toLowerCase();

    const result = await forgotPassword(formData);

    if (result?.code === "RATE_LIMIT") {
      setSubmittedEmail(cleanEmail);
      const remaining = getRemainingCooldown(`forgot_cooldown_${cleanEmail}`) || 60;
      setCountdown(remaining);
      setLoading(false);
      return;
    }

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSubmittedEmail(cleanEmail);
    setCountdown(60);
    setCooldownExpiry(`forgot_cooldown_${cleanEmail}`, 60);
    setLoading(false);
  }

  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!submittedEmail) return;

    const clean = otpToken.trim().replace(/\s+/g, "");
    if (!clean) {
      setOtpError("Please enter the 6-digit reset code sent to your email.");
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    const result = await verifyRecoveryOtp({
      email: submittedEmail,
      token: clean,
    });

    if (result?.error) {
      setOtpError(result.error);
      setOtpLoading(false);
      return;
    }

    if (result?.success) {
      window.location.href = "/reset-password";
    }
  }

  async function handleResend() {
    if (countdown > 0 || resendLoading || !submittedEmail) return;
    setResendLoading(true);
    setResendMessage(null);
    setOtpError(null);

    const result = await forgotPassword(submittedEmail);
    setResendLoading(false);

    if (result?.code === "RATE_LIMIT") {
      setResendMessage({ type: "error", text: result.error || "Please wait before requesting another email." });
      const remaining = getRemainingCooldown(`forgot_cooldown_${submittedEmail}`) || 60;
      setCountdown(remaining);
      return;
    }

    if (result?.error) {
      setResendMessage({ type: "error", text: result.error });
    } else {
      setResendMessage({
        type: "success",
        text: "A fresh password reset link and code has been sent to your email!",
      });
      setCountdown(60);
      setCooldownExpiry(`forgot_cooldown_${submittedEmail}`, 60);
    }
  }

  const loginLink = `/login?${new URLSearchParams({
    ...(redirectUrl ? { redirect: redirectUrl } : {}),
    ...(submittedEmail ? { email: submittedEmail } : emailParam ? { email: emailParam } : {}),
  }).toString()}`;

  if (verifiedRedirecting) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-background">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-6">
            <CheckCircle2 className="size-8" />
          </div>
          <span className="aa-eyebrow inline-block mb-2 text-emerald-600">Verified Successfully</span>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Access Granted!
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Your identity has been verified. Redirecting you to set a new password...
          </p>
          <div className="mt-8 flex justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (submittedEmail) {
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

          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <MailCheck className="size-8" />
          </div>
          <span className="aa-eyebrow inline-block mb-2">Reset Instructions Sent</span>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Check your email
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            We have sent a secure password reset link and verification code to{" "}
            <span className="font-semibold text-foreground">{submittedEmail}</span>.
            Click the link in your email or enter the 6-digit code below:
          </p>

          {/* OTP Code Form */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm text-left">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="size-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                Enter 6-Digit Reset Code
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Enter the verification code from your email to reset your password on this device immediately.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div>
                <Label htmlFor="otpCode" className="sr-only">
                  Reset Code
                </Label>
                <Input
                  id="otpCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={10}
                  placeholder="e.g. 997656"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  className="h-12 text-center text-lg font-mono tracking-widest uppercase rounded-xl"
                  required
                />
              </div>

              {otpError && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{otpError}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={otpLoading || !otpToken.trim()}
                className="w-full h-11 rounded-xl font-medium shadow-sm gap-2"
              >
                {otpLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Verifying code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code &amp; Reset Password</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Resend & Spam Instructions */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm text-left text-xs space-y-4">
            <div>
              <p className="font-semibold text-foreground text-sm mb-1">
                Didn&apos;t receive the email?
              </p>
              <ul className="text-muted-foreground space-y-1">
                <li>1. Check your spam, updates, or promotions folder.</li>
                <li>2. Verify you entered the correct address.</li>
              </ul>
            </div>

            {resendMessage && (
              <div
                className={`flex items-start gap-2 rounded-xl p-3 text-xs ${
                  resendMessage.type === "success"
                    ? "border border-primary/20 bg-primary/5 text-primary"
                    : "border border-destructive/20 bg-destructive/10 text-destructive"
                }`}
              >
                {resendMessage.type === "success" ? (
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                )}
                <span>{resendMessage.text}</span>
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                disabled={resendLoading || countdown > 0}
                onClick={handleResend}
                className="w-full h-10 rounded-xl gap-2 text-xs font-medium cursor-pointer"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Sending email...</span>
                  </>
                ) : countdown > 0 ? (
                  <>
                    <RotateCw className="size-3.5 text-muted-foreground animate-spin" />
                    <span>Resend email in {countdown}s</span>
                  </>
                ) : (
                  <>
                    <RotateCw className="size-3.5" />
                    <span>Resend Reset Email</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={() => {
                setSubmittedEmail(null);
                setOtpToken("");
                setOtpError(null);
                setResendMessage(null);
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Use a different email address
            </button>
            <div>
              <Link href={loginLink}>
                <Button variant="ghost" className="w-full h-11 rounded-xl text-muted-foreground hover:text-foreground">
                  Return to Sign In
                </Button>
              </Link>
            </div>
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
        <span className="aa-eyebrow inline-block mb-2">Account Recovery</span>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a link and code to reset it
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
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Account Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue={emailParam || ""}
                placeholder="priya@example.com"
                className="h-11 rounded-xl"
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
                  <span>Sending reset link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link &amp; Code</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-6 text-center">
            <Link
              href={loginLink}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-background">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}

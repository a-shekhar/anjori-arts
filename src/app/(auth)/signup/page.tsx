"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
  MailCheck,
  AlertCircle,
  RotateCw,
  CheckCircle2,
  KeyRound,
  UserCheck,
} from "lucide-react";
import { signup, resendVerificationEmail, verifySignupOtp } from "@/actions/auth";
import { createClient, performSignOut } from "@/lib/supabase/client";
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

function SignupForm() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [existingAccountEmail, setExistingAccountEmail] = useState<string | null>(null);

  // Existing session state
  const [currentUser, setCurrentUser] = useState<{ email?: string; name?: string } | null>(null);

  // OTP Verification state
  const [otpToken, setOtpToken] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Resend Email state
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [resendAlreadyVerified, setResendAlreadyVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Cross-tab auto-redirect state
  const [verifiedRedirecting, setVerifiedRedirecting] = useState(false);

  // Check and restore remaining cooldown from storage when on verification screen
  useEffect(() => {
    if (!verificationRequired || !submittedEmail) return;
    const remaining = getRemainingCooldown(`signup_cooldown_${submittedEmail.trim().toLowerCase()}`);
    if (remaining > 0) {
      setCountdown(remaining);
    }
  }, [verificationRequired, submittedEmail]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const meta = user.user_metadata || {};
        const name =
          meta.full_name ||
          [meta.first_name, meta.last_name].filter(Boolean).join(" ") ||
          user.email?.split("@")[0] ||
          "Collector";
        setCurrentUser({ email: user.email, name });
      }
    });
  }, []);

  // Listen for verification / login from another tab or window
  useEffect(() => {
    if (!verificationRequired) return;

    const supabase = createClient();

    const handleSessionDetected = () => {
      setVerifiedRedirecting(true);
      setTimeout(() => {
        window.location.href = redirectUrl || "/account";
      }, 600);
    };

    // 1. Supabase cross-tab auth state change listener (BroadcastChannel)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED")) {
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

    // 3. Periodic polling interval every 2.5 seconds while on verification screen
    const pollInterval = setInterval(checkVerificationStatus, 2500);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("focus", checkVerificationStatus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(pollInterval);
    };
  }, [verificationRequired, redirectUrl]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const clean = otpToken.trim().replace(/\s+/g, "");
    if (!clean) {
      setOtpError("Please enter the verification code sent to your email.");
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    const result = await verifySignupOtp({
      email: submittedEmail,
      token: clean,
    });

    if (result?.error) {
      setOtpError(result.error);
      setOtpLoading(false);
      return;
    }

    if (result?.success) {
      const destination = redirectUrl || "/account";
      window.location.href = destination;
    }
  }

  async function handleResend() {
    if (countdown > 0 || resendLoading) return;
    setResendLoading(true);
    setResendMessage(null);
    setOtpError(null);

    const result = await resendVerificationEmail(submittedEmail);
    setResendLoading(false);

    if (result?.alreadyVerified) {
      setResendAlreadyVerified(true);
      setResendMessage({
        type: "error",
        text: result.error || "This account is already verified! You can sign in directly.",
      });
      return;
    }

    if (result?.code === "RATE_LIMIT") {
      setResendMessage({ type: "error", text: result.error || "Please wait before requesting another email." });
      const remaining = getRemainingCooldown(`signup_cooldown_${submittedEmail.trim().toLowerCase()}`) || 60;
      setCountdown(remaining);
      return;
    }

    if (result?.error) {
      setResendMessage({ type: "error", text: result.error });
    } else {
      setResendMessage({
        type: "success",
        text: "A fresh verification link and code has been sent to your email!",
      });
      setCountdown(60);
      setCooldownExpiry(`signup_cooldown_${submittedEmail.trim().toLowerCase()}`, 60);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setExistingAccountEmail(null);

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

    if (result?.code === "ACCOUNT_EXISTS") {
      setExistingAccountEmail(result.email || email);
      setError(null);
      setLoading(false);
      return;
    }

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result?.requiresVerification) {
      setVerificationRequired(true);
      setCountdown(60);
      setCooldownExpiry(`signup_cooldown_${email.trim().toLowerCase()}`, 60);
      setLoading(false);
      return;
    }

    if (result?.success) {
      // Immediate session created (email verification disabled)
      const destination = redirectUrl || "/account";
      window.location.href = destination;
    }
  }

  const loginLink = `/login?${new URLSearchParams({
    ...(redirectUrl ? { redirect: redirectUrl } : {}),
    ...(submittedEmail ? { email: submittedEmail } : {}),
  }).toString()}`;

  if (currentUser) {
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
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <UserCheck className="size-7" />
          </div>
          <span className="aa-eyebrow inline-block mb-2">Active Session</span>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Already Signed In
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            You are currently signed in as{" "}
            <span className="font-semibold text-foreground">{currentUser.name}</span>
            {currentUser.email ? ` (${currentUser.email})` : ""}.
          </p>

          <div className="mt-8 space-y-3">
            <Link href={redirectUrl || "/account"} className="block">
              <Button className="w-full h-11 rounded-xl font-medium shadow-sm gap-2">
                <span>Go to My Account</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl cursor-pointer"
              onClick={async () => {
                setCurrentUser(null);
                await performSignOut({ redirectTo: "/signup" });
              }}
            >
              Sign Out to Create a New Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (verifiedRedirecting) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-background">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-6">
            <CheckCircle2 className="size-8" />
          </div>
          <span className="aa-eyebrow inline-block mb-2 text-emerald-600">Verification Complete</span>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Account Activated!
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Your email has been verified. Redirecting you to your account...
          </p>
          <div className="mt-8 flex justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

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
            We have sent a verification link and code to{" "}
            <span className="font-semibold text-foreground">{submittedEmail}</span>.
            Click the link in your email or enter the code below to activate your account.
          </p>

          {/* OTP Code Form */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm text-left">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="size-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                Enter Verification Code
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Enter the verification code from your email to activate instantly.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div>
                <Label htmlFor="otpCode" className="sr-only">
                  Verification Code
                </Label>
                <Input
                  id="otpCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={10}
                  placeholder="e.g. 99765606"
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
                    <span>Verify &amp; Activate Account</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Resend & Spam instructions */}
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

            {resendAlreadyVerified && (
              <Link href={loginLink} className="block">
                <Button className="w-full h-10 rounded-xl text-xs font-semibold gap-1.5 shadow-sm">
                  <span>Sign In to Your Account</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
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
                    <span>Resend Verification Email</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <Link href={loginLink}>
              <Button variant="ghost" className="w-full h-11 rounded-xl text-muted-foreground hover:text-foreground">
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
          {existingAccountEmail ? (
            <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm space-y-4 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary shrink-0 mt-0.5">
                  <UserCheck className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-base">Account Already Exists</h3>
                  <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                    An account registered with <strong className="text-foreground">{existingAccountEmail}</strong> already exists. You don&apos;t need to create a new one!
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <Link
                  href={`/login?${new URLSearchParams({
                    email: existingAccountEmail,
                    ...(redirectUrl ? { redirect: redirectUrl } : {}),
                  }).toString()}`}
                  className="flex-1"
                >
                  <Button className="w-full h-10 rounded-xl text-xs font-semibold gap-1.5 shadow-sm">
                    <span>Sign In to Your Account</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
                <Link
                  href={`/forgot-password?${new URLSearchParams({
                    email: existingAccountEmail,
                    ...(redirectUrl ? { redirect: redirectUrl } : {}),
                  }).toString()}`}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full h-10 rounded-xl text-xs font-medium gap-1.5">
                    <KeyRound className="size-3.5" />
                    <span>Reset Password</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : error ? (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">
              <AlertCircle className="size-5 shrink-0 text-destructive mt-0.5" />
              <span>{error}</span>
            </div>
          ) : null}

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
                onChange={() => {
                  if (existingAccountEmail) setExistingAccountEmail(null);
                  if (error) setError(null);
                }}
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


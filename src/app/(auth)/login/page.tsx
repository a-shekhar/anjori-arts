"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const reason = searchParams.get("reason");
  const errorParam = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    if (reason === "not_admin") {
      return "Access restricted: Your account does not have administrator privileges.";
    }
    if (reason === "no_session" || reason === "unauthorized") {
      return "Please sign in to continue.";
    }
    if (errorParam === "auth_callback_failed") {
      return "The verification link was invalid or expired. Please try signing in.";
    }
    return null;
  });

  const successMessage = (() => {
    if (reason === "registered") {
      return "Your account has been created successfully! Please sign in.";
    }
    if (reason === "reset_success") {
      return "Your password has been updated. Please sign in with your new password.";
    }
    return null;
  })();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result?.success) {
      let destination = redirectUrl;
      if (!destination) {
        destination = result.role === "ADMIN" ? "/admin" : "/account";
      }
      window.location.href = destination;
    }
  }

  const signupLink = redirectUrl
    ? `/signup?redirect=${encodeURIComponent(redirectUrl)}`
    : "/signup";

  const forgotPasswordLink = redirectUrl
    ? `/forgot-password?redirect=${encodeURIComponent(redirectUrl)}`
    : "/forgot-password";

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
        <span className="aa-eyebrow inline-block mb-2">Welcome Back</span>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Sign in to your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Access your orders, saved collection, or admin portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          {successMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-sm text-primary">
              <CheckCircle2 className="size-5 shrink-0 text-primary mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">
              <AlertCircle className="size-5 shrink-0 text-destructive mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="priya@example.com"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Password
                </Label>
                <Link
                  href={forgotPasswordLink}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl font-medium shadow-sm transition-all gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account yet?{" "}
            <Link
              href={signupLink}
              className="font-medium text-primary hover:underline transition-colors"
            >
              Create an account
            </Link>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground text-center">
          <ShieldCheck className="size-4 text-muted-foreground/80" />
          <span>Encrypted and secured by Anjori Arts Authentication</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-background">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

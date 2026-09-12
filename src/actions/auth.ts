"use server";

import { revalidatePath } from "next/cache";
import { headers, cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getSiteUrl(): Promise<string> {
  try {
    const headersList = await headers();
    const forwardedHost = headersList.get("x-forwarded-host");
    const host = forwardedHost || headersList.get("host");
    const proto =
      headersList.get("x-forwarded-proto") ||
      (process.env.NODE_ENV === "production" ? "https" : "http");
    if (host) {
      return `${proto}://${host}`;
    }
  } catch {
    // Fallback if called outside request context
  }
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

export interface AuthActionResult {
  success?: boolean;
  error?: string;
  code?: "ACCOUNT_EXISTS" | "INVALID_CREDENTIALS" | "RATE_LIMIT" | string;
  role?: string;
  requiresVerification?: boolean;
  email?: string;
  alreadyVerified?: boolean;
}

// In-memory sliding cooldown manager to stop rapid abuse across server actions
const cooldownMap = new Map<string, number>();
const COOLDOWN_SECONDS = 60;

function checkAndSetCooldown(key: string): { allowed: boolean; remainingSeconds: number } {
  const now = Date.now();
  const lastSent = cooldownMap.get(key);
  if (lastSent) {
    const elapsedSeconds = Math.floor((now - lastSent) / 1000);
    if (elapsedSeconds < COOLDOWN_SECONDS) {
      return { allowed: false, remainingSeconds: COOLDOWN_SECONDS - elapsedSeconds };
    }
  }
  cooldownMap.set(key, now);

  // Evict entries older than 10 minutes to maintain lean memory
  if (cooldownMap.size > 500) {
    for (const [k, timestamp] of cooldownMap.entries()) {
      if (now - timestamp > 600_000) {
        cooldownMap.delete(k);
      }
    }
  }

  return { allowed: true, remainingSeconds: 0 };
}

export async function login(formData: FormData): Promise<AuthActionResult> {
  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const parsed = loginSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid credentials provided." };
    }

    const { email, password } = parsed.data;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    if (!data.user) {
      return { error: "Failed to sign in. Please try again." };
    }

    // Check user role from profiles
    let role = "USER";
    try {
      const adminClient = createAdminClient();
      const { data: profile } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile?.role) {
        role = profile.role;
      }
    } catch (e) {
      console.error("[login] Error fetching profile role:", e);
    }

    revalidatePath("/", "layout");
    return { success: true, role };
  } catch (err: unknown) {
    console.error("[login] Unexpected error:", err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function signup(formData: FormData): Promise<AuthActionResult> {
  try {
    const rawData = {
      firstName: formData.get("firstName") as string,
      lastName: (formData.get("lastName") as string) || "",
      email: formData.get("email") as string,
      countryCode: (formData.get("countryCode") as string) || "+91",
      phone: (formData.get("phone") as string) || "",
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const parsed = signupSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid registration details." };
    }

    const { firstName, lastName, email, countryCode, phone, password } = parsed.data;
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const fullPhone = phone ? `${countryCode}${phone}` : "";

    const supabase = await createClient();

    const siteUrl = await getSiteUrl();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/account`,
        data: {
          first_name: firstName,
          last_name: lastName || "",
          full_name: fullName,
          phone: fullPhone,
          country_code: countryCode,
        },
      },
    });

    if (error) {
      if (
        error.message.toLowerCase().includes("already registered") ||
        (error as { status?: number }).status === 422
      ) {
        return {
          error: "An account with this email address already exists. Please sign in or use forgot password.",
          code: "ACCOUNT_EXISTS",
          email,
        };
      }
      return { error: error.message };
    }

    if (!data.user) {
      return { error: "Unable to create account. Please try again." };
    }

    // When email enumeration protection is enabled, Supabase returns an empty identities array for existing users
    if (data.user.identities && data.user.identities.length === 0) {
      return {
        error: "An account with this email address already exists. Please sign in or use forgot password.",
        code: "ACCOUNT_EXISTS",
        email,
      };
    }

    // Ensure profile row exists in arts.profiles
    try {
      const adminClient = createAdminClient();
      await adminClient
        .from("profiles")
        .insert({ id: data.user.id, role: "USER" })
        .select()
        .maybeSingle();
    } catch (profileErr) {
      console.warn("[signup] Profile insert notice (trigger may have created it):", profileErr);
    }

    revalidatePath("/", "layout");
    const requiresVerification = !data.session;
    if (requiresVerification) {
      cooldownMap.set(`signup:${email.trim().toLowerCase()}`, Date.now());
    }
    return { success: true, requiresVerification, role: "USER" };
  } catch (err: unknown) {
    console.error("[signup] Unexpected error:", err);
    return { error: "An unexpected error occurred during registration. Please try again." };
  }
}

export async function resendVerificationEmail(email: string): Promise<AuthActionResult> {
  try {
    if (!email || !email.includes("@")) {
      return { error: "Please provide a valid email address." };
    }

    const cleanEmail = email.trim().toLowerCase();

    // Enforce 60-second cooldown rate limit for signup resend
    const cooldownCheck = checkAndSetCooldown(`signup:${cleanEmail}`);
    if (!cooldownCheck.allowed) {
      return {
        error: `Please wait ${cooldownCheck.remainingSeconds}s before requesting another verification email.`,
        code: "RATE_LIMIT",
      };
    }

    // Check if the account is already verified in Supabase Auth
    try {
      const adminClient = createAdminClient();
      const { data: usersData } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 100 });
      const existingUser = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === cleanEmail
      );
      if (existingUser && existingUser.email_confirmed_at) {
        return {
          error: "This account is already verified! You can sign in directly.",
          code: "ACCOUNT_EXISTS",
          alreadyVerified: true,
          email: cleanEmail,
        };
      }
    } catch (e) {
      console.warn("[resendVerificationEmail] Admin check skipped:", e);
    }

    const supabase = await createClient();
    const siteUrl = await getSiteUrl();

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: cleanEmail,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/account`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("[resendVerificationEmail] Unexpected error:", err);
    return { error: "Failed to resend verification email. Please try again." };
  }
}

export async function verifySignupOtp({
  email,
  token,
}: {
  email: string;
  token: string;
}): Promise<AuthActionResult> {
  try {
    if (!email || !token) {
      return { error: "Email and verification code are required." };
    }

    const cleanToken = token.trim().replace(/\s+/g, "");
    if (cleanToken.length < 6) {
      return { error: "Please enter a valid verification code." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: cleanToken,
      type: "signup",
    });

    if (error) {
      return { error: error.message };
    }

    if (!data.user) {
      return { error: "Verification failed. Please check the code and try again." };
    }

    // Ensure profile row exists in arts.profiles
    try {
      const adminClient = createAdminClient();
      await adminClient
        .from("profiles")
        .insert({ id: data.user.id, role: "USER" })
        .select()
        .maybeSingle();
    } catch (profileErr) {
      console.warn("[verifySignupOtp] Profile insert notice (trigger may have created it):", profileErr);
    }

    revalidatePath("/", "layout");
    return { success: true, role: "USER" };
  } catch (err: unknown) {
    console.error("[verifySignupOtp] Unexpected error:", err);
    return { error: "An unexpected error occurred during verification. Please try again." };
  }
}

export async function logout(): Promise<AuthActionResult> {
  try {
    const supabase = await createClient();
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch (e) {
      console.warn("[logout] signOut notice:", e);
    }

    try {
      const cookieStore = await cookies();
      const allCookies = cookieStore.getAll();
      for (const c of allCookies) {
        if (
          c.name.startsWith("sb-") ||
          c.name.includes("supabase") ||
          c.name.includes("auth-token")
        ) {
          cookieStore.delete(c.name);
          cookieStore.set(c.name, "", {
            path: "/",
            maxAge: 0,
            expires: new Date(0),
            sameSite: "lax",
            httpOnly: false,
          });
        }
      }
    } catch (cookieErr) {
      console.warn("[logout] Cookie delete notice:", cookieErr);
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: unknown) {
    console.error("[logout] Unexpected error:", err);
    return { error: "An unexpected error occurred during logout." };
  }
}

export async function forgotPassword(input: FormData | string): Promise<AuthActionResult> {
  try {
    const rawEmail = typeof input === "string" ? input : (input.get("email") as string);

    const parsed = forgotPasswordSchema.safeParse({ email: rawEmail });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Please provide a valid email address." };
    }

    const { email } = parsed.data;
    const cleanEmail = email.trim().toLowerCase();

    // Enforce 60-second cooldown rate limit for password reset
    const cooldownCheck = checkAndSetCooldown(`reset_password:${cleanEmail}`);
    if (!cooldownCheck.allowed) {
      return {
        error: `Please wait ${cooldownCheck.remainingSeconds}s before requesting another password reset email.`,
        code: "RATE_LIMIT",
      };
    }

    const supabase = await createClient();

    const siteUrl = await getSiteUrl();

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("[forgotPassword] Unexpected error:", err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function verifyRecoveryOtp({
  email,
  token,
}: {
  email: string;
  token: string;
}): Promise<AuthActionResult> {
  try {
    if (!email || !token) {
      return { error: "Email and recovery code are required." };
    }

    const cleanToken = token.trim().replace(/\s+/g, "");
    if (cleanToken.length < 6) {
      return { error: "Please enter a valid 6-digit recovery code." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: cleanToken,
      type: "recovery",
    });

    if (error) {
      return { error: error.message };
    }

    if (!data.user) {
      return { error: "Verification failed. The code may be expired or invalid." };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: unknown) {
    console.error("[verifyRecoveryOtp] Unexpected error:", err);
    return { error: "An unexpected error occurred during verification. Please try again." };
  }
}

export async function resetPassword(formData: FormData): Promise<AuthActionResult> {
  try {
    const rawData = {
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const parsed = resetPasswordSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid password provided." };
    }

    const { password } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: unknown) {
    console.error("[resetPassword] Unexpected error:", err);
    return { error: "An unexpected error occurred while updating your password." };
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    let role = "USER";
    try {
      const adminClient = createAdminClient();
      const { data: profile } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role) {
        role = profile.role;
      }
    } catch (e) {
      console.error("[getCurrentUser] Error fetching profile:", e);
    }

    return {
      id: user.id,
      email: user.email,
      role,
      metadata: user.user_metadata,
      createdAt: user.created_at,
    };
  } catch (e) {
    console.error("[getCurrentUser] Unexpected error:", e);
    return null;
  }
}

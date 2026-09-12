"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

export interface AuthActionResult {
  success?: boolean;
  error?: string;
  role?: string;
  requiresVerification?: boolean;
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

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

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
      return { error: error.message };
    }

    if (!data.user) {
      return { error: "Unable to create account. Please try again." };
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
    return { success: true, requiresVerification, role: "USER" };
  } catch (err: unknown) {
    console.error("[signup] Unexpected error:", err);
    return { error: "An unexpected error occurred during registration. Please try again." };
  }
}

export async function logout(): Promise<AuthActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: unknown) {
    console.error("[logout] Unexpected error:", err);
    return { error: "An unexpected error occurred during logout." };
  }
}

export async function forgotPassword(formData: FormData): Promise<AuthActionResult> {
  try {
    const rawData = {
      email: formData.get("email") as string,
    };

    const parsed = forgotPasswordSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Please provide a valid email address." };
    }

    const { email } = parsed.data;
    const supabase = await createClient();

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
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

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  profileUpdateSchema,
  userAddressSchema,
  updatePasswordSchema,
} from "@/lib/validations/account";
import type { UserAddress } from "@/types";

export interface AccountActionResult {
  success?: boolean;
  error?: string;
  emailVerificationSent?: boolean;
  newEmail?: string;
}

/**
 * Update authenticated user's profile metadata and email with verification.
 */
export async function updateProfile(formData: FormData): Promise<AccountActionResult> {
  try {
    const rawData = {
      firstName: formData.get("firstName") as string,
      lastName: (formData.get("lastName") as string) || "",
      countryCode: (formData.get("countryCode") as string) || "+91",
      phone: (formData.get("phone") as string) || "",
      email: (formData.get("email") as string)?.trim() || "",
    };

    const parsed = profileUpdateSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid profile details." };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "You must be signed in to update your profile." };
    }

    const { firstName, lastName, countryCode, phone, email: requestedEmail } = parsed.data;
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const fullPhone = phone ? `${countryCode}${phone}` : "";

    const isEmailChanged =
      Boolean(requestedEmail) &&
      requestedEmail?.toLowerCase() !== user.email?.toLowerCase();

    const isOAuthUser =
      user.app_metadata?.provider === "google" ||
      (user.app_metadata?.providers &&
        Array.isArray(user.app_metadata.providers) &&
        user.app_metadata.providers.includes("google") &&
        !user.app_metadata.providers.includes("email"));

    if (isEmailChanged && isOAuthUser) {
      return { error: "Email for Google-authenticated accounts must be managed through Google." };
    }

    const updatePayload: {
      data: {
        first_name: string;
        last_name: string;
        full_name: string;
        phone: string;
        country_code: string;
      };
      email?: string;
    } = {
      data: {
        first_name: firstName,
        last_name: lastName || "",
        full_name: fullName,
        phone: fullPhone,
        country_code: countryCode,
      },
    };

    if (isEmailChanged && requestedEmail) {
      updatePayload.email = requestedEmail;
    }

    const { error: updateError } = await supabase.auth.updateUser(updatePayload);

    if (updateError) {
      return { error: updateError.message };
    }

    revalidatePath("/account", "layout");
    return {
      success: true,
      emailVerificationSent: isEmailChanged,
      newEmail: isEmailChanged ? requestedEmail : undefined,
    };
  } catch (err) {
    console.error("[updateProfile] Unexpected error:", err);
    return { error: "An unexpected error occurred while updating your profile." };
  }
}

/**
 * Fetch all saved delivery addresses for the authenticated user.
 */
export async function getUserAddresses(): Promise<UserAddress[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return [];
    }

    const { data, error } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getUserAddresses] Error fetching addresses:", error);
      return [];
    }

    return (data || []) as UserAddress[];
  } catch (err) {
    console.error("[getUserAddresses] Unexpected error:", err);
    return [];
  }
}

/**
 * Add or update a saved delivery address (max 5 addresses per user).
 */
export async function saveAddress(
  formData: FormData,
  addressId?: string
): Promise<AccountActionResult & { id?: string }> {
  try {
    const rawData = {
      recipient_name: formData.get("recipient_name") as string,
      phone: formData.get("phone") as string,
      street: formData.get("street") as string,
      landmark: (formData.get("landmark") as string) || "",
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      pincode: formData.get("pincode") as string,
      address_type: (formData.get("address_type") as string) || "home",
      is_default: formData.get("is_default") === "true" || formData.get("is_default") === "on",
    };

    const parsed = userAddressSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid address details." };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "You must be signed in to manage delivery addresses." };
    }

    // Check address limit if creating a new address
    if (!addressId) {
      const { count, error: countError } = await supabase
        .from("user_addresses")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (!countError && typeof count === "number" && count >= 5) {
        return {
          error: "You can save a maximum of 5 delivery addresses. Please update or remove an existing address.",
        };
      }
    }

    const payload = {
      recipient_name: parsed.data.recipient_name,
      phone: parsed.data.phone,
      street: parsed.data.street,
      landmark: parsed.data.landmark || null,
      city: parsed.data.city,
      state: parsed.data.state,
      pincode: parsed.data.pincode,
      address_type: parsed.data.address_type,
      is_default: parsed.data.is_default,
    };

    // If marked as default, clear other defaults first
    if (payload.is_default) {
      await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    if (addressId) {
      const { error: updateError } = await supabase
        .from("user_addresses")
        .update(payload)
        .eq("id", addressId)
        .eq("user_id", user.id);

      if (updateError) {
        return { error: updateError.message };
      }
    } else {
      // If this is the user's first address, automatically make it default
      const { count: existingCount } = await supabase
        .from("user_addresses")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (existingCount === 0) {
        payload.is_default = true;
      }

      const { data: newRow, error: insertError } = await supabase
        .from("user_addresses")
        .insert({
          ...payload,
          user_id: user.id,
        })
        .select("id")
        .single();

      if (insertError) {
        return { error: insertError.message };
      }

      revalidatePath("/account/addresses");
      revalidatePath("/checkout");
      return { success: true, id: newRow?.id };
    }

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: true };
  } catch (err) {
    console.error("[saveAddress] Unexpected error:", err);
    return { error: "An unexpected error occurred while saving your address." };
  }
}

/**
 * Delete a saved delivery address.
 */
export async function deleteAddress(addressId: string): Promise<AccountActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "You must be signed in to delete an address." };
    }

    const { error: deleteError } = await supabase
      .from("user_addresses")
      .delete()
      .eq("id", addressId)
      .eq("user_id", user.id);

    if (deleteError) {
      return { error: deleteError.message };
    }

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: true };
  } catch (err) {
    console.error("[deleteAddress] Unexpected error:", err);
    return { error: "An unexpected error occurred while deleting the address." };
  }
}

/**
 * Set an address as the default delivery address.
 */
export async function setDefaultAddress(addressId: string): Promise<AccountActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "You must be signed in to update default address." };
    }

    // Reset other defaults
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);

    // Set new default
    const { error: updateError } = await supabase
      .from("user_addresses")
      .update({ is_default: true })
      .eq("id", addressId)
      .eq("user_id", user.id);

    if (updateError) {
      return { error: updateError.message };
    }

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: true };
  } catch (err) {
    console.error("[setDefaultAddress] Unexpected error:", err);
    return { error: "An unexpected error occurred while setting the default address." };
  }
}

/**
 * Update password for email/password authenticated users.
 */
export async function updatePassword(formData: FormData): Promise<AccountActionResult> {
  try {
    const rawData = {
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const parsed = updatePasswordSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid password provided." };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return { error: "You must be signed in to update your password." };
    }

    // Verify current password before permitting password change
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.currentPassword,
    });

    if (verifyError) {
      return { error: "Current password does not match our records. Please verify and try again." };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    });

    if (updateError) {
      return { error: updateError.message };
    }

    return { success: true };
  } catch (err) {
    console.error("[updatePassword] Unexpected error:", err);
    return { error: "An unexpected error occurred while updating your password." };
  }
}

/**
 * Log out from all devices by invalidating all active user sessions globally.
 */
export async function logoutAllDevices(): Promise<AccountActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) {
      return { error: error.message };
    }
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("[logoutAllDevices] Unexpected error:", err);
    return { error: "An unexpected error occurred while signing out from all devices." };
  }
}

/**
 * Permanently delete the collector's account.
 * Associated orders have user_id set to NULL for audit integrity.
 */
export async function deleteUserAccount(confirmationWord: string): Promise<AccountActionResult> {
  try {
    if (confirmationWord.trim() !== "DELETE") {
      return { error: "Confirmation keyword must be 'DELETE' to proceed." };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required to delete account." };
    }

    // Delete user using service role admin client
    const adminDb = createAdminClient();
    const { error: deleteError } = await adminDb.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("[deleteUserAccount] Admin delete user error:", deleteError);
      return { error: deleteError.message || "Failed to delete account." };
    }

    // Sign out local session
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("[deleteUserAccount] Unexpected error:", err);
    return { error: "An unexpected error occurred while deleting your account." };
  }
}


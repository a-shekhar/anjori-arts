"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { withAdminAuth } from "@/lib/auth-admin";
import { revalidatePath } from "next/cache";
import type { Inquiry, InquiryStatus } from "@/types";

export interface AdminInquiryStats {
  total: number;
  newCount: number;
  reviewedCount: number;
  inProgressCount: number;
  resolvedCount: number;
  archivedCount: number;
}

function mapInquiry(row: any): Inquiry {
  return {
    id: row.id,
    inquiry_reference: row.inquiry_reference,
    status: (row.status || "new") as InquiryStatus,
    created_at: row.created_at,
    updated_at: row.updated_at ?? row.created_at,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    country_code: row.country_code || "+91",
    phone: row.phone ?? null,
    category: row.category,
    subject: row.subject,
    message: row.message,
    admin_notes: row.admin_notes ?? null,
  };
}

export const getAdminInquiries = withAdminAuth(async (): Promise<Inquiry[]> => {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getAdminInquiries] Error fetching inquiries:", error);
      return [];
    }

    return (data || []).map(mapInquiry);
  } catch (err) {
    console.error("[getAdminInquiries] Unexpected error:", err);
    return [];
  }
}, { fallback: [] });

export const getAdminInquiryStats = withAdminAuth(async (): Promise<AdminInquiryStats> => {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("inquiries")
      .select("status");

    if (error) {
      console.error("[getAdminInquiryStats] Error fetching stats:", error);
      return {
        total: 0,
        newCount: 0,
        reviewedCount: 0,
        inProgressCount: 0,
        resolvedCount: 0,
        archivedCount: 0,
      };
    }

    const rows = data || [];
    const stats: AdminInquiryStats = {
      total: rows.length,
      newCount: 0,
      reviewedCount: 0,
      inProgressCount: 0,
      resolvedCount: 0,
      archivedCount: 0,
    };

    for (const row of rows) {
      const s = (row.status || "new").toLowerCase();
      if (s === "new") stats.newCount++;
      else if (s === "reviewed") stats.reviewedCount++;
      else if (s === "in_progress") stats.inProgressCount++;
      else if (s === "resolved") stats.resolvedCount++;
      else if (s === "archived") stats.archivedCount++;
    }

    return stats;
  } catch (err) {
    console.error("[getAdminInquiryStats] Unexpected error:", err);
    return {
      total: 0,
      newCount: 0,
      reviewedCount: 0,
      inProgressCount: 0,
      resolvedCount: 0,
      archivedCount: 0,
    };
  }
}, {
  fallback: {
    total: 0,
    newCount: 0,
    reviewedCount: 0,
    inProgressCount: 0,
    resolvedCount: 0,
    archivedCount: 0,
  }
});

export const getAdminInquiryById = withAdminAuth(async (id: string): Promise<Inquiry | null> => {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .or(`id.eq.${id},inquiry_reference.eq.${id}`)
      .maybeSingle();

    if (error) {
      console.error("[getAdminInquiryById] Error fetching inquiry:", error);
      return null;
    }

    if (!data) return null;

    return mapInquiry(data);
  } catch (err) {
    console.error("[getAdminInquiryById] Unexpected error:", err);
    return null;
  }
}, { fallback: null });

export const updateInquiryStatus = withAdminAuth(async (
  id: string,
  status: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    if (!id || !status) {
      return { success: false, message: "Inquiry ID and status are required." };
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("inquiries")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("[updateInquiryStatus] Error updating status:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: any) {
    console.error("[updateInquiryStatus] Unexpected error:", err);
    return { success: false, message: err?.message || "Failed to update inquiry status." };
  }
});

export const updateInquiryNotes = withAdminAuth(async (
  id: string,
  adminNotes: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    if (!id) {
      return { success: false, message: "Inquiry ID is required." };
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("inquiries")
      .update({
        admin_notes: adminNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("[updateInquiryNotes] Error saving notes:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: any) {
    console.error("[updateInquiryNotes] Unexpected error:", err);
    return { success: false, message: err?.message || "Failed to save inquiry notes." };
  }
});

export const deleteInquiry = withAdminAuth(async (
  id: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    if (!id) {
      return { success: false, message: "Inquiry ID is required." };
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("inquiries")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[deleteInquiry] Error deleting inquiry:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: any) {
    console.error("[deleteInquiry] Unexpected error:", err);
    return { success: false, message: err?.message || "Failed to delete inquiry." };
  }
});


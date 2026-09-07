import type { Metadata } from "next";
import { getAdminInquiries, getAdminInquiryStats } from "@/actions/admin-inquiries";
import { AdminInquiriesTable } from "@/components/admin/inquiries/AdminInquiriesTable";

export const metadata: Metadata = {
  title: "Inquiry Management | Admin | Anjori Arts",
  description: "Review customer inquiries, respond via Email or WhatsApp, and track lead resolution.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const [inquiries, stats] = await Promise.all([
    getAdminInquiries(),
    getAdminInquiryStats(),
  ]);

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminInquiriesTable initialInquiries={inquiries} stats={stats} />
    </div>
  );
}


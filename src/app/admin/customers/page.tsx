import type { Metadata } from "next";
import { getAdminCustomers } from "@/actions/admin-customers";
import { AdminCustomersTable } from "@/components/admin/customers/AdminCustomersTable";

export const metadata: Metadata = {
  title: "Customer & Collector Management | Admin | Anjori Arts",
  description: "View and manage art collectors, registered accounts, and guest buyers.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const { customers, stats } = await getAdminCustomers();

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Collectors &amp; Customer Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Track collector relationships, order histories, Lifetime Value (LTV), and delivery addresses.
          </p>
        </div>
      </div>

      {/* Main Table with KPI Stats */}
      <AdminCustomersTable initialCustomers={customers} stats={stats} />
    </div>
  );
}


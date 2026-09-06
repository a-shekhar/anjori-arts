import type { Metadata } from "next";
import { getAdminOrders, getAdminOrderStats } from "@/actions/admin-orders";
import { AdminOrdersTable } from "@/components/admin/orders/AdminOrdersTable";

export const metadata: Metadata = {
  title: "Order Management | Admin | Anjori Arts",
  description: "Track and fulfill orders, verify payments, and manage courier tracking.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const [ordersRes, stats] = await Promise.all([
    getAdminOrders({ limit: 100 }),
    getAdminOrderStats(),
  ]);

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Order Fulfillment &amp; Operations
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Track orders from Received ➔ Confirmed ➔ Framing/Packing ➔ Dispatched ➔ Delivered.
          </p>
        </div>
      </div>

      {/* Main Table with KPI Stats */}
      <AdminOrdersTable initialOrders={ordersRes.orders} stats={stats} />
    </div>
  );
}


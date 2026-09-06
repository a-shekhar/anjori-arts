import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { getAdminOrderById } from "@/actions/admin-orders";
import { AdminOrderDetailView } from "@/components/admin/orders/AdminOrderDetailView";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Order Details | Admin | Anjori Arts",
  description: "Manage fulfillment, payments, and courier dispatch tracking.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const resolved = await params;
  const order = await getAdminOrderById(resolved.id);

  if (!order) {
    return (
      <div className="flex-1 p-6 sm:p-10 flex flex-col items-center justify-center text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ShoppingBag className="size-8" />
        </div>
        <h1 className="mt-4 font-serif text-2xl font-bold text-foreground">
          Order Not Found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No order was found matching identifier &ldquo;{resolved.id}&rdquo;.
        </p>
        <Link
          href="/admin/orders"
          className="mt-6 inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to All Orders</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <AdminOrderDetailView initialOrder={order} />
    </div>
  );
}


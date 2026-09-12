import type { Metadata } from "next";
import { getUserOrders, getUserCustomOrders } from "@/actions/orders";
import { OrdersView } from "@/components/account/OrdersView";

export const metadata: Metadata = {
  title: "Orders & Acquisitions | Anjori Arts",
  description: "Track shipment status, view receipts, and review custom commission inquiries.",
};

export default async function AccountOrdersPage() {
  const [orders, customOrders] = await Promise.all([
    getUserOrders(),
    getUserCustomOrders(),
  ]);

  return <OrdersView orders={orders} customOrders={customOrders} />;
}

import { Metadata } from "next";
import Link from "next/link";
import { getAdminCustomOrders } from "@/actions/admin-custom-orders";
import { CustomOrdersTable } from "@/components/admin/custom-orders-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  Paintbrush,
  Clock,
  CheckCircle2,
  ExternalLink,
  Inbox,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Orders | Admin",
  description: "Manage bespoke commissions and customer inquiries.",
};

export default async function AdminCustomOrdersPage() {
  const orders = await getAdminCustomOrders();

  // Metrics computation
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) =>
    ["new", "submitted"].includes(o.status.toLowerCase())
  ).length;
  const activeOrders = orders.filter((o) =>
    ["reviewed", "quoted", "accepted", "in_progress"].includes(o.status.toLowerCase())
  ).length;
  const completedOrders = orders.filter(
    (o) => o.status.toLowerCase() === "completed"
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-3xl font-bold tracking-tight">Custom Orders</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {totalOrders} total
            </span>
          </div>
          <p className="text-muted-foreground mt-1">
            Review custom commission inquiries, update project milestones, and communicate with clients.
          </p>
        </div>
        <Link
          href="/custom-order"
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline" })}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View Public Form
        </Link>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Inquiries
            </CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              All time commission requests
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-200">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">
              {pendingOrders}
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-1">
              New submissions awaiting response
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-indigo-900 dark:text-indigo-200">
              Active Commissions
            </CardTitle>
            <Paintbrush className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-200">
              {activeOrders}
            </div>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-1">
              Under review, quoted, or in progress
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-emerald-900 dark:text-emerald-200">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">
              {completedOrders}
            </div>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-1">
              Finished and delivered artworks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table and Cards */}
      <CustomOrdersTable orders={orders} />
    </div>
  );
}

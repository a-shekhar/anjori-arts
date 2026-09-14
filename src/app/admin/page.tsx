import { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Palette, PenTool, Paintbrush, MessageSquare, PlusCircle, ArrowRight, Users, ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard | Anjori Arts",
};

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  // Fetch quick metrics concurrently
  const [artworksRes, blogRes, inquiriesRes, customOrdersRes, profilesRes, ordersRes] = await Promise.all([
    supabase.from("artworks").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("*", { count: "exact", head: true }),
    supabase.from("custom_orders").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
  ]);

  const metrics = {
    artworks: artworksRes.count || 0,
    blogs: blogRes.count || 0,
    inquiries: inquiriesRes.count || 0,
    customOrders: customOrdersRes.count || 0,
    collectors: profilesRes.count || 0,
    orders: ordersRes.count || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to the Anjori Arts admin dashboard.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
        <Link href="/admin/orders" className="block transition hover:opacity-90">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3.5 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Orders</CardTitle>
              <ShoppingBag className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3.5 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{metrics.orders}</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/customers" className="block transition hover:opacity-90">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3.5 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Collectors</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3.5 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{metrics.collectors}</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/artworks" className="block transition hover:opacity-90">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3.5 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Artworks</CardTitle>
              <Palette className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3.5 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{metrics.artworks}</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/custom-orders" className="block transition hover:opacity-90">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3.5 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Custom Art</CardTitle>
              <Paintbrush className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3.5 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{metrics.customOrders}</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/inquiries" className="block transition hover:opacity-90">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3.5 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Inquiries</CardTitle>
              <MessageSquare className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3.5 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{metrics.inquiries}</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/blog" className="block transition hover:opacity-90">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3.5 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Blog Posts</CardTitle>
              <PenTool className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3.5 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{metrics.blogs}</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link href="/admin/artworks/new" className={buttonVariants({ variant: "default", className: "w-full min-h-[44px] h-11 rounded-xl justify-start" })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Artwork
              </Link>
              <Link href="/admin/blog/new" className={buttonVariants({ variant: "outline", className: "w-full min-h-[44px] h-11 rounded-xl justify-start" })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Write Blog Post
              </Link>
              <Link href="/admin/customers" className={buttonVariants({ variant: "secondary", className: "w-full min-h-[44px] h-11 rounded-xl justify-start" })}>
                <Users className="mr-2 h-4 w-4" /> View Collectors
              </Link>
              <Link href="/admin/orders" className={buttonVariants({ variant: "secondary", className: "w-full min-h-[44px] h-11 rounded-xl justify-start" })}>
                <ShoppingBag className="mr-2 h-4 w-4" /> Manage Orders
              </Link>
              <Link href="/admin/custom-orders" className={buttonVariants({ variant: "secondary", className: "w-full min-h-[44px] h-11 rounded-xl justify-start" })}>
                <Paintbrush className="mr-2 h-4 w-4" /> View Custom Orders
              </Link>
              <Link href="/admin/inquiries" className={buttonVariants({ variant: "secondary", className: "w-full min-h-[44px] h-11 rounded-xl justify-start" })}>
                <MessageSquare className="mr-2 h-4 w-4" /> Manage Inquiries
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

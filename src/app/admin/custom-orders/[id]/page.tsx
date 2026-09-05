import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getAdminCustomOrderById,
  getAdminCustomOrderTaxonomies,
} from "@/actions/admin-custom-orders";
import { CustomOrderDetailActions } from "@/components/admin/custom-order-detail-actions";
import { CustomOrderSpecsCard } from "@/components/admin/custom-order-specs-card";
import { CustomOrderQuotationCard } from "@/components/admin/custom-order-quotation-card";
import {
  getStatusBadgeVariant,
  formatStatusLabel,
} from "@/lib/custom-orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Mail,
  User,
} from "lucide-react";

interface AdminCustomOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AdminCustomOrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await getAdminCustomOrderById(id);

  if (!order) {
    return { title: "Order Not Found | Admin" };
  }

  return {
    title: `Custom Order ${order.order_reference} | Admin`,
    description: `Manage custom artwork order ${order.order_reference} from ${order.first_name} ${order.last_name}`,
  };
}

export default async function AdminCustomOrderDetailPage({
  params,
}: AdminCustomOrderDetailPageProps) {
  const { id } = await params;
  const [order, taxonomies] = await Promise.all([
    getAdminCustomOrderById(id),
    getAdminCustomOrderTaxonomies(),
  ]);

  if (!order) {
    notFound();
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground transition-colors">
          Admin
        </Link>
        <span>/</span>
        <Link
          href="/admin/custom-orders"
          className="hover:text-foreground transition-colors"
        >
          Custom Orders
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium font-mono">
          {order.order_reference}
        </span>
      </nav>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/custom-orders"
            className={buttonVariants({
              variant: "outline",
              size: "icon",
              className: "h-9 w-9 shrink-0",
            })}
            aria-label="Back to custom orders"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight font-mono">
                {order.order_reference}
              </h2>
              <Badge
                variant="outline"
                className={`text-xs px-2.5 py-0.5 font-medium ${getStatusBadgeVariant(
                  order.status
                )}`}
              >
                {formatStatusLabel(order.status)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <Calendar className="h-3.5 w-3.5" /> Submitted on {formatDate(order.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Main Details (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information Card */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Customer Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Full Name</span>
                <span className="font-medium text-foreground text-base">
                  {order.first_name} {order.last_name}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Email Address</span>
                <a
                  href={`mailto:${order.email}`}
                  className="font-medium text-primary hover:underline break-all flex items-center gap-1.5 mt-0.5"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {order.email}
                </a>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Phone Number</span>
                <span className="font-medium text-foreground mt-0.5 block">
                  {order.phone ? `${order.country_code} ${order.phone}` : "Not provided"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Country Code</span>
                <span className="font-medium text-foreground mt-0.5 block">
                  {order.country_code}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Editable Commission Specifications Card */}
          <CustomOrderSpecsCard
            order={order}
            categoryOptions={taxonomies.categories}
            surfaceOptions={taxonomies.surfaces}
            mediumOptions={taxonomies.mediums}
          />

          {/* Itemized Artwork Quotation & Financial Card */}
          <CustomOrderQuotationCard order={order} />

          {/* Customer Message Card */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold">
                Customer Message & Project Brief
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="p-4 rounded-lg bg-muted/40 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {order.message}
              </div>
            </CardContent>
          </Card>

          {/* Reference Images Gallery */}
          <Card>
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Reference Images ({order.reference_images.length})
              </CardTitle>
              {order.reference_images.length === 0 && (
                <span className="text-xs text-muted-foreground">No images attached</span>
              )}
            </CardHeader>
            <CardContent className="pt-4">
              {order.reference_images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {order.reference_images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-lg border overflow-hidden bg-muted"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Reference inspiration ${idx + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        unoptimized
                      />
                      <a
                        href={imgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1.5"
                      >
                        <ExternalLink className="h-4 w-4" /> Open Full Image
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  The customer did not upload reference images for this custom order.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Sidebar (Right 1 col) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <CustomOrderDetailActions order={order} />
          </div>
        </div>
      </div>
    </div>
  );
}

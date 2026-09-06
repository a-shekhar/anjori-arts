import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { getOrderByNumber } from "@/actions/orders";
import { OrderSuccessReceipt } from "@/components/orders/OrderSuccessReceipt";

interface OrderSuccessPageProps {
  params: Promise<{ orderNumber: string }>;
}

export async function generateMetadata({
  params,
}: OrderSuccessPageProps): Promise<Metadata> {
  const resolved = await params;
  return {
    title: `Order Confirmed: ${resolved.orderNumber} | Anjori Arts`,
    description: "Official acquisition receipt and order tracking at Anjori Arts.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function OrderSuccessPage({
  params,
}: OrderSuccessPageProps) {
  const resolved = await params;
  const order = await getOrderByNumber(resolved.orderNumber);

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ShoppingBag className="size-8" />
        </div>
        <h1 className="mt-4 font-serif text-2xl font-bold text-foreground sm:text-3xl">
          Order Not Found
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          We could not locate an order matching reference &ldquo;{resolved.orderNumber}&rdquo;. Please verify your reference or contact our gallery desk.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <ArrowLeft className="size-4" />
          <span>Return to Gallery</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background print:min-h-0 print:bg-white">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16 print:p-0 print:m-0 print:max-w-none">
        <OrderSuccessReceipt order={order} />
      </main>
    </div>
  );
}


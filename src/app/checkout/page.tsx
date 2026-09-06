import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Secure Collector Checkout",
  description:
    "Complete your handcrafted artwork reservation, enter shipping details, and select secure payment options at Anjori Arts.",
  alternates: {
    canonical: `${siteConfig.url}/checkout`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="border-b border-border bg-muted/30 px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow mb-2.5 inline-block">Order Finalization</span>
          <h1 className="font-serif text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl lg:text-5xl">
            Collector Checkout
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Enter your insured delivery destination and choose your preferred payment option.
          </p>
        </div>
      </section>

      {/* Main Form Content */}
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <CheckoutForm />
      </main>
    </div>
  );
}


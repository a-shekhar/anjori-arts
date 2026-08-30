import type { Metadata } from "next";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  HelpCircle,
  MessageCircle,
  PackageX,
  PhoneCall,
  RefreshCw,
  ShieldCheck,
  Undo2,
} from "lucide-react";
import { siteConfig, phoneHref, inquiryHref } from "@/config/site";

export const metadata: Metadata = {
  title: "Returns & Refund Policy",
  description:
    "Review our cancellation, damage replacement, and refund policy for handmade paintings and custom commissions at Anjori Arts.",
  alternates: {
    canonical: `${siteConfig.url}/returns`,
  },
  openGraph: {
    title: "Returns & Refunds | Anjori Arts",
    description:
      "Transparent return policies, transit damage protection, and 100% money-back guarantee for collectors.",
    url: `${siteConfig.url}/returns`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
};

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header Banner */}
      <section className="aa-hero-grid border-b border-border/80 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow inline-block mb-3">Customer Confidence</span>
          <h1 className="font-serif text-3xl font-semibold tracking-[-0.03em] sm:text-5xl lg:text-6xl text-foreground">
            Returns &amp; Refund Policy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Every creation at Anjori Arts is made by hand with dedication. Here is our clear, collector-first policy on damage replacements, returns, and refunds.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 space-y-12">
        
        {/* Transit Damage Guarantee */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-card p-6 sm:p-8">
          <div className="flex items-center gap-3 text-primary">
            <ShieldCheck className="size-6 shrink-0" />
            <h2 className="font-serif text-xl font-semibold text-foreground">
              100% Transit Damage Guarantee
            </h2>
          </div>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
            All shipments are insured during transit. If an artwork arrives damaged due to courier handling, we offer an <strong className="text-foreground">immediate free re-creation or 100% refund</strong> without friction.
          </p>
          <div className="mt-4 rounded-xl border border-border bg-background/80 p-4 text-xs sm:text-sm text-muted-foreground">
            <strong className="text-foreground font-semibold">How to claim:</strong> Please share 2–3 clear unboxing photos/videos of the package and damaged piece on WhatsApp (<strong>+91 80519 60916</strong>) or email (<strong>support@anjoriarts.com</strong>) within <span className="text-foreground font-medium">24 hours</span> of delivery.
          </div>
        </div>

        {/* Ready Artworks vs Custom Commissions */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Ready Artworks */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <RefreshCw className="size-5" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground">
                Ready-to-Ship Artworks
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Pre-made original paintings and handcrafted earrings can be returned or exchanged within <strong className="text-foreground">48 hours of receipt</strong> provided they are unused, in original un-stretched condition, and in protective packaging.
              </p>
            </div>
            <div className="mt-5 rounded-lg bg-muted/60 px-3 py-2 text-xs text-foreground font-medium flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary shrink-0" /> Eligible for return / exchange
            </div>
          </div>

          {/* Custom Commissions */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-4">
                <PackageX className="size-5" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground">
                Custom Orders &amp; Bespoke Art
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Custom-dimension paintings and personalized names/themes are made specifically for you and cannot be returned once approved. However, we send <strong className="text-foreground">work-in-progress photos for your approval</strong> before varnishing and dispatching.
              </p>
            </div>
            <div className="mt-5 rounded-lg bg-muted/60 px-3 py-2 text-xs text-foreground font-medium flex items-center gap-2">
              <AlertCircle className="size-4 text-primary shrink-0" /> Full preview approval before dispatch
            </div>
          </div>
        </div>

        {/* Refund Processing Timeline */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Clock className="size-5" />
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Refund Timelines via Razorpay
            </h2>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
            Approved refunds are credited directly back to the original payment source (UPI, Credit/Debit card, NetBanking, Wallet) through our secure payment gateway Razorpay:
          </p>

          <div className="grid gap-3 sm:grid-cols-3 text-xs sm:text-sm pt-2">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <span className="font-semibold text-foreground block">UPI Payments</span>
              <span className="text-muted-foreground text-xs mt-1 block">Instant to 24–48 business hours</span>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <span className="font-semibold text-foreground block">Cards (Visa/MC/RuPay)</span>
              <span className="text-muted-foreground text-xs mt-1 block">3 to 5 banking working days</span>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <span className="font-semibold text-foreground block">NetBanking / Wallets</span>
              <span className="text-muted-foreground text-xs mt-1 block">2 to 4 banking working days</span>
            </div>
          </div>
        </div>

        {/* Order Cancellation */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-3 text-primary">
            <Undo2 className="size-5" />
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Order Cancellations
            </h2>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
            • <strong>Ready Inventory:</strong> Orders can be cancelled at zero charge before courier dispatch (typically within 12–24 hours of placing the order).<br />
            • <strong>Custom Commissions:</strong> Orders can be cancelled before our artist begins surface preparation and line sketching. Once materials are dedicated, a minimal 15% drafting fee applies if cancelled.
          </p>
        </div>

        {/* Help Banner */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
              <HelpCircle className="size-5 text-primary" /> Need assistance with a return?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Our team is available every day to assist you directly.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={phoneHref}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <PhoneCall className="size-4 text-primary" /> Call Us
            </a>
            <a
              href={inquiryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          </div>
        </div>

      </section>
    </main>
  );
}

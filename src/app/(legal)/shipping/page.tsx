import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  MapPin,
  PackageCheck,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { siteConfig, phoneHref } from "@/config/site";
import { DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD } from "@/config/constants";
import { formatPrice } from "@/lib/helpers";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy",
  description:
    "Learn about our nationwide shipping process, packaging standards for delicate handmade Indian art, timelines, and transit insurance at Anjori Arts.",
  alternates: {
    canonical: `${siteConfig.url}/shipping`,
  },
  openGraph: {
    title: "Shipping & Delivery | Anjori Arts",
    description:
      "Safe, museum-grade artwork packaging & insured delivery across all serviceable pincodes in India.",
    url: `${siteConfig.url}/shipping`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
};

export default function ShippingPage() {
  const freeThresholdDisplay = formatPrice(FREE_DELIVERY_THRESHOLD);
  const standardDeliveryDisplay = formatPrice(DELIVERY_CHARGE);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DeliveryChargeSpecification",
    name: "Standard Artwork Shipping in India",
    appliesToDeliveryMethod: "http://purl.org/goodrelations/v1#DeliveryModeDirectDownload",
    price: standardDeliveryDisplay,
    priceCurrency: "INR",
    eligibleTransactionVolume: {
      "@type": "PriceSpecification",
      price: freeThresholdDisplay,
      priceCurrency: "INR",
    },
    description: `Free insured shipping on orders above ${freeThresholdDisplay}. All shipments are custom-crated and safely delivered across India.`,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Schema.org Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Section with Brand Gradient */}
      <section className="aa-hero-grid border-b border-border/80 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow inline-block mb-3">Careful Transit &amp; Delivery</span>
          <h1 className="font-serif text-3xl font-semibold tracking-[-0.03em] sm:text-5xl lg:text-6xl text-foreground">
            Shipping &amp; Delivery
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Every painting and handcrafted piece is irreplaceable. Here is how we ensure each artwork arrives in pristine, gallery-ready condition at your doorstep.
          </p>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-transform hover:-translate-y-0.5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
              <Truck className="size-5" />
            </div>
            <h2 className="font-serif text-lg font-semibold text-foreground">Nationwide Delivery</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We ship across 19,000+ pincodes across India via premier air &amp; surface logistics partners (Blue Dart, Delhivery, DTDC).
            </p>
            <div className="mt-4 rounded-lg bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground">
              Free delivery on orders above {freeThresholdDisplay}
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-transform hover:-translate-y-0.5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
              <PackageCheck className="size-5" />
            </div>
            <h2 className="font-serif text-lg font-semibold text-foreground">Museum-Grade Packaging</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Acid-free glassine paper, moisture-barrier wrapping, corner edge protectors, high-density bubble foam, and hardboard reinforcement.
            </p>
            <div className="mt-4 rounded-lg bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground">
              Weather-sealed &amp; drop-tested
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-transform hover:-translate-y-0.5 sm:col-span-2 lg:col-span-1">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
              <ShieldCheck className="size-5" />
            </div>
            <h2 className="font-serif text-lg font-semibold text-foreground">100% Transit Insured</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              All parcels travel with full transit protection. In the rare event of transit damage, you are protected with immediate restoration or full refund.
            </p>
            <div className="mt-4 rounded-lg bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground">
              Zero risk to collectors
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Shipping Timeline & Rates */}
      <section className="border-t border-border/80 bg-muted/20 px-5 py-14 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl space-y-12">
          
          {/* Dispatch & Delivery Timelines */}
          <div>
            <div className="flex items-center gap-3">
              <Clock className="size-5 text-primary" />
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                Dispatch &amp; Delivery Timelines
              </h2>
            </div>

            <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
              <div className="grid gap-2 p-5 sm:grid-cols-[1.5fr_2fr] sm:gap-6 sm:p-6">
                <div>
                  <h3 className="font-medium text-foreground">Ready Originals &amp; Crafts</h3>
                  <span className="text-xs text-muted-foreground">Pre-made paintings &amp; earrings</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Dispatched within <strong className="text-foreground">24 to 48 hours</strong>. Delivery takes 3–5 business days depending on destination city.
                </p>
              </div>

              <div className="grid gap-2 p-5 sm:grid-cols-[1.5fr_2fr] sm:gap-6 sm:p-6">
                <div>
                  <h3 className="font-medium text-foreground">Custom Art &amp; Commissions</h3>
                  <span className="text-xs text-muted-foreground">Bespoke paintings &amp; custom sizes</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Creation time spans <strong className="text-foreground">7 to 18 days</strong> depending on intricacy (22K gold foil curation or fine line Mithila detail). Dispatched via express courier upon client approval.
                </p>
              </div>

              <div className="grid gap-2 p-5 sm:grid-cols-[1.5fr_2fr] sm:gap-6 sm:p-6">
                <div>
                  <h3 className="font-medium text-foreground">Metro &amp; Tier-1 Cities</h3>
                  <span className="text-xs text-muted-foreground">Delhi NCR, Mumbai, Bengaluru, etc.</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Typically delivered within <strong className="text-foreground">2 to 4 business days</strong> post dispatch.
                </p>
              </div>

              <div className="grid gap-2 p-5 sm:grid-cols-[1.5fr_2fr] sm:gap-6 sm:p-6">
                <div>
                  <h3 className="font-medium text-foreground">Rest of India</h3>
                  <span className="text-xs text-muted-foreground">Tier-2, Tier-3 &amp; regional towns</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Delivered within <strong className="text-foreground">4 to 7 business days</strong> post dispatch.
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Rates Table */}
          <div>
            <div className="flex items-center gap-3">
              <MapPin className="size-5 text-primary" />
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                Shipping Charges
              </h2>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="p-4 sm:px-6">Order Value</th>
                    <th className="p-4 sm:px-6">Standard Shipping</th>
                    <th className="p-4 sm:px-6">Insurance &amp; Crating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  <tr>
                    <td className="p-4 sm:px-6 font-medium">Orders ₹1,500 &amp; Above</td>
                    <td className="p-4 sm:px-6 text-primary font-semibold">FREE</td>
                    <td className="p-4 sm:px-6 text-muted-foreground">Included Free</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:px-6 font-medium">Orders Below ₹1,500</td>
                    <td className="p-4 sm:px-6">{standardDeliveryDisplay} flat</td>
                    <td className="p-4 sm:px-6 text-muted-foreground">Included Free</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Packaging Walkthrough */}
          <div className="rounded-2xl border border-border bg-gradient-to-br from-card via-card to-muted/40 p-6 sm:p-8">
            <div className="flex items-center gap-2.5 text-primary">
              <Sparkles className="size-5" />
              <span className="aa-eyebrow">Our Unboxing Standard</span>
            </div>
            <h3 className="mt-2 font-serif text-xl font-semibold text-foreground">
              How Your Artwork is Packaged
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>Non-stick acid-free sheet preventing friction on paint surfaces.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>Reinforced waterproof shrink wrap for monsoon &amp; humidity protection.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>Heavy-duty dual-ply corrugated outer sleeve or rigid mailing cylinder.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>Certificate of Authenticity and artist care note included inside.</span>
              </div>
            </div>
          </div>

          {/* Support / Questions Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
                <HelpCircle className="size-5 text-primary" /> Have questions about your delivery?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Need urgent express dispatch or assistance tracking an existing order?
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={phoneHref}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <PhoneCall className="size-4 text-primary" /> Call Us
              </a>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                View FAQ
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

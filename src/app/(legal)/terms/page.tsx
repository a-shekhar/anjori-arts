import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { ShieldCheck, Scale, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read the terms of service, intellectual property guidelines, custom commission contracts, and user agreements for Anjori Arts.",
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
  openGraph: {
    title: "Terms & Conditions | Anjori Arts",
    description: "Official terms of service, copyright notices, and purchase policies.",
    url: `${siteConfig.url}/terms`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header Banner */}
      <section className="aa-hero-grid border-b border-border/80 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow inline-block mb-3">Legal &amp; Governance</span>
          <h1 className="font-serif text-3xl font-semibold tracking-[-0.03em] sm:text-5xl lg:text-6xl text-foreground">
            Terms &amp; Conditions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Please read these terms carefully before exploring our gallery, ordering original handmade paintings, or commissioning bespoke artwork.
          </p>
        </div>
      </section>

      {/* Terms Body */}
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 space-y-10 text-sm sm:text-base leading-relaxed text-muted-foreground">
        
        {/* Section 1: Overview */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2.5">
            <FileText className="size-5 text-primary" /> 1. Overview &amp; Acceptance
          </h2>
          <p>
            This website (<strong className="text-foreground">anjoriarts.com</strong>) is operated by Anjori Arts (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). Throughout the site, the terms &quot;you&quot; and &quot;customer&quot; refer to the user browsing or purchasing from our platform. By visiting our site and/or purchasing handmade Indian art from us, you engage in our &quot;Service&quot; and agree to be bound by the following terms and conditions.
          </p>
        </div>

        {/* Section 2: Handmade Art Authenticity & Variations */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2.5">
            <ShieldCheck className="size-5 text-primary" /> 2. Handmade Authenticity &amp; Subtle Variations
          </h2>
          <p>
            All paintings, drawings, and handcrafted earrings displayed on Anjori Arts are original works made entirely by human hands using traditional techniques (Mithila/Madhubani, Tanjore with 22K gold foil, Pichwai, and Warli).
          </p>
          <p>
            Because each piece is individually hand-drawn and hand-pigmented, subtle nuances in line brushwork, mineral dye saturation, and texture are hallmarks of genuine authenticity and should not be considered defects.
          </p>
        </div>

        {/* Section 3: Intellectual Property */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2.5">
            <Scale className="size-5 text-primary" /> 3. Copyright &amp; Intellectual Property Rights
          </h2>
          <p>
            Purchasing a physical painting or commissioned piece transfers physical ownership of that specific artwork to the buyer. <strong className="text-foreground">All intellectual property, moral rights, and reproduction copyrights remain exclusively with Anjori Arts and the respective artist.</strong>
          </p>
          <p>
            Artwork may not be photographed for commercial reproduction, mass-reprinted, scanned into NFT mints, or used in commercial merchandising without explicit written license from Anjori Arts.
          </p>
        </div>

        {/* Section 4: Pricing & Payments */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            4. Pricing, Taxes &amp; Payments via Razorpay
          </h2>
          <p>
            • All prices are quoted in Indian Rupees (INR ₹) and are inclusive/exclusive of GST as indicated at checkout.<br />
            • Payments are processed securely through RBI-compliant gateway <strong className="text-foreground">Razorpay</strong>. We do not store or process debit/credit card numbers or banking passwords on our servers.<br />
            • We reserve the right to revise catalog prices or discontinue artwork offerings at any time without prior notice.
          </p>
        </div>

        {/* Section 5: Custom Commissions */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            5. Custom Orders &amp; Milestone Approvals
          </h2>
          <p>
            For custom commissioned paintings, production begins upon mutual agreement on design sketch, dimensions, and upfront deposit. We provide milestone preview photographs for client verification. Custom commissions are non-returnable once final approval is granted and dispatch is completed.
          </p>
        </div>

        {/* Section 6: Jurisdiction */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            6. Governing Law &amp; Dispute Resolution
          </h2>
          <p>
            These Terms of Service and any separate agreements shall be governed by and construed in accordance with the laws of India, subject to the jurisdiction of competent courts in Bihar / New Delhi, India.
          </p>
        </div>

        {/* Contact Info */}
        <div className="text-xs text-muted-foreground text-center pt-4">
          For questions regarding these Terms, contact us at{" "}
          <a href={`mailto:${siteConfig.email.support}`} className="text-primary hover:underline font-medium">
            {siteConfig.email.support}
          </a>
        </div>

      </section>
    </main>
  );
}

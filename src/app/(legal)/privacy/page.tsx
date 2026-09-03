import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Lock, Shield, EyeOff, FileKey } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Understand how Anjori Arts collects, protects, and handles your personal information, shipping addresses, and transaction security.",
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy | Anjori Arts",
    description:
      "Our privacy commitment, zero-spam guarantee, and bank-level data encryption principles.",
    url: `${siteConfig.url}/privacy`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <section className="aa-hero-grid border-b border-border/80 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow inline-block mb-3">Privacy &amp; Data Protection</span>
          <h1 className="font-serif text-3xl font-semibold tracking-[-0.03em] sm:text-5xl lg:text-6xl text-foreground">
            Privacy Policy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            At Anjori Arts, we value the trust you place in us. Here is our straightforward, transparent commitment to safeguarding your personal data.
          </p>
        </div>
      </section>

      {/* Main Policy Content */}
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 space-y-10 text-sm sm:text-base leading-relaxed text-muted-foreground">
        
        {/* Zero-Spam / Core Promise */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Lock className="size-5" />
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Our Plain English Privacy Guarantee
            </h2>
          </div>
          <p className="text-foreground/90 font-medium">
            We never sell, rent, or trade your phone number, email address, or shipping location to third-party advertisers. Your information is used strictly to deliver your artwork, send order updates, and provide personalized commission support.
          </p>
        </div>

        {/* 1. Information We Collect */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2.5">
            <FileKey className="size-5 text-primary" /> 1. Information We Collect
          </h2>
          <p>
            When you purchase art, submit a custom inquiry, or reach out to us, we collect:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Contact details:</strong> Name, email address, phone/WhatsApp number.</li>
            <li><strong>Delivery details:</strong> Shipping street address, city, state, postal pincode.</li>
            <li><strong>Custom commission references:</strong> Photos, wall dimensions, design sketches uploaded for custom paintings.</li>
            <li><strong>Technical data:</strong> IP address, device type, and browser preferences to ensure fast page loads and smooth layout responsiveness.</li>
          </ul>
        </div>

        {/* 2. Payment Data Security */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2.5">
            <Shield className="size-5 text-primary" /> 2. Payment Data Security (Razorpay)
          </h2>
          <p>
            All monetary transactions on Anjori Arts are processed via <strong className="text-foreground">Razorpay</strong> with 256-bit SSL encryption adhering to PCI-DSS Level 1 compliance. 
          </p>
          <p>
            <strong className="text-foreground">Anjori Arts does not see, capture, or store your credit/debit card numbers, CVVs, UPI PINs, or net banking passwords.</strong>
          </p>
        </div>

        {/* 3. Logistical Sharing */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2.5">
            <EyeOff className="size-5 text-primary" /> 3. Courier &amp; Third-Party Service Providers
          </h2>
          <p>
            We share only essential delivery information (recipient name, address, contact number) with certified logistics partners (Blue Dart, Delhivery, DTDC, Shiprocket) solely to execute door-to-door transit and provide real-time SMS tracking.
          </p>
        </div>

        {/* 4. Contact for Data Removal */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            4. Data Retention &amp; Your Rights
          </h2>
          <p>
            You have the right to request a copy of your personal data or ask for the deletion of your account/address history from our database at any time.
          </p>
          <p>
            For privacy inquiries, please contact our Data Grievance Officer at{" "}
            <a href={`mailto:${siteConfig.email.support}`} className="text-primary hover:underline font-medium">
              {siteConfig.email.support}
            </a>.
          </p>
        </div>

      </section>
    </div>
  );
}

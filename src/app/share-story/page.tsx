import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { TestimonialSubmissionForm } from "@/components/forms/testimonial-submission-form";
import { ShieldCheck, HeartHandshake, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Share Your Collector Story",
  description:
    "Share your experience, review, and living space photograph of your Anjori Arts handmade painting or custom commission.",
  alternates: {
    canonical: `${siteConfig.url}/share-story`,
  },
  openGraph: {
    title: "Share Your Collector Story | Anjori Arts",
    description:
      "Share your thoughts and living space photos of your handmade Indian painting or custom commission.",
    url: `${siteConfig.url}/share-story`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Share Your Collector Story | Anjori Arts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Share Your Collector Story | Anjori Arts",
    description:
      "Share your thoughts and living space photos of your handmade Indian painting or custom commission.",
    images: [siteConfig.ogImage],
  },
};

export default function ShareStoryPage() {
  // Schema.org WebPage JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Share Your Collector Story — Anjori Arts",
    description:
      "Share your thoughts and living space photos of your handmade Indian painting or custom commission.",
    url: `${siteConfig.url}/share-story`,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background">
        {/* Hero Header */}
        <section className="aa-hero-grid border-b border-border/80 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="aa-eyebrow mb-3">Collector Community</p>
            <h1 className="font-serif text-3xl font-medium tracking-[-0.03em] sm:text-5xl lg:text-6xl text-foreground leading-[1.15]">
              Every artwork carries a new life in your home.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg leading-relaxed">
              Whether you acquired an original painting or commissioned a bespoke piece, we would love to hear your story and see how it enlivens your space.
            </p>
          </div>
        </section>

        {/* Main Content Area */}
        <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
          <TestimonialSubmissionForm />

          {/* Community Trust Points */}
          <div className="mt-12 grid gap-6 border-t border-border pt-8 sm:grid-cols-3 text-center sm:text-left">
            <div className="space-y-2">
              <div className="mx-auto sm:mx-0 flex size-9 items-center justify-center rounded-xl bg-muted text-primary">
                <Eye className="size-4" />
              </div>
              <h2 className="text-xs font-semibold tracking-wider uppercase text-foreground">
                Respect for Privacy
              </h2>
              <p className="text-xs leading-5 text-muted-foreground">
                We only display your first name (or preferred initials) and city. No contact details are ever published.
              </p>
            </div>

            <div className="space-y-2">
              <div className="mx-auto sm:mx-0 flex size-9 items-center justify-center rounded-xl bg-muted text-primary">
                <HeartHandshake className="size-4" />
              </div>
              <h2 className="text-xs font-semibold tracking-wider uppercase text-foreground">
                Direct Artist Support
              </h2>
              <p className="text-xs leading-5 text-muted-foreground">
                Your feedback directly motivates our master artisans and apprentices preserving these centuries-old art forms.
              </p>
            </div>

            <div className="space-y-2">
              <div className="mx-auto sm:mx-0 flex size-9 items-center justify-center rounded-xl bg-muted text-primary">
                <ShieldCheck className="size-4" />
              </div>
              <h2 className="text-xs font-semibold tracking-wider uppercase text-foreground">
                Vetted & Authentic
              </h2>
              <p className="text-xs leading-5 text-muted-foreground">
                Every review is verified by our studio team to ensure an honest, inspiring community for art collectors.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/stories"
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              ← View existing collector stories &amp; living space photographs
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

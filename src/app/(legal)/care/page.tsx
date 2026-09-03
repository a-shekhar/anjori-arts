import type { Metadata } from "next";

import {
  Check,
  Droplets,
  PhoneCall,
  Shield,
  Sparkles,
  Sun,
  Wind,
} from "lucide-react";
import { siteConfig, phoneHref, inquiryHref } from "@/config/site";

export const metadata: Metadata = {
  title: "Artwork Care & Preservation Guide",
  description:
    "Learn expert preservation techniques for handmade Madhubani paper art, 22K gold Tanjore woodwork, Pichwai canvas, and handmade clay jewelry.",
  alternates: {
    canonical: `${siteConfig.url}/care`,
  },
  openGraph: {
    title: "Artwork Care Guide | Anjori Arts",
    description:
      "Preserve the vibrant pigments and 22K gold luster of your handmade Indian art for generations.",
    url: `${siteConfig.url}/care`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
};

const CARE_GUIDELINES = [
  {
    title: "Mithila / Madhubani Paintings (Handmade Paper & Silk)",
    icon: Wind,
    dos: [
      "Frame using acid-free matting with UV-filtered acrylic or non-reflective glass.",
      "Ensure a small 2–3mm gap between the glass and painting surface to allow the fibers to breathe.",
      "Dust the outer frame lightly with a dry microfiber cloth.",
    ],
    donts: [
      "Never expose directly to harsh, uninterrupted midday sunlight or high moisture bathrooms.",
      "Never use water, wet wipes, chemical cleaners, or detergents on the paint surface.",
    ],
  },
  {
    title: "Tanjore 22K Gold Foil Paintings (Teakwood Boards)",
    icon: Sparkles,
    dos: [
      "Keep framed in airtight traditional Chettinad teakwood or moisture-sealed box frames.",
      "Display in living areas, pooja rooms, or foyers with warm accent spotlights to highlight the 22K gold relief.",
      "Store upright in temperature-controlled indoor spaces.",
    ],
    donts: [
      "Do not hang directly adjacent to air conditioners with condensation drips.",
      "Do not press or scratch the raised gold gesso work (Muckwork) with sharp fingernails.",
    ],
  },
  {
    title: "Pichwai & Canvas Artworks (Natural Dyes & Acrylic)",
    icon: Sun,
    dos: [
      "Stretch over sturdy seasoned pine or teakwood stretcher bars before wall mounting.",
      "Gently buff the varnished canvas with a soft feather duster or dry lint-free cloth.",
      "Maintain ambient room temperature (20°C–32°C).",
    ],
    donts: [
      "Never fold, crease, or roll un-stretched canvas with the painted side inward.",
      "Avoid damp basement walls or damp seepage spots on plaster.",
    ],
  },
  {
    title: "Handcrafted Terracotta & Silk Thread Earrings",
    icon: Droplets,
    dos: [
      "Store individually in separate velvet pouches or ziplock bags away from dust.",
      "Wear your jewelry after applying perfumes, hairsprays, and lotions.",
      "Keep silica gel packets in your jewelry box during rainy monsoon seasons.",
    ],
    donts: [
      "Never submerge in water or wear during swimming/showering.",
      "Avoid sleeping with clay or silk earrings to prevent structural pressure.",
    ],
  },
];

export default function CarePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <section className="aa-hero-grid border-b border-border/80 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow inline-block mb-3">Preservation &amp; Longevity</span>
          <h1 className="font-serif text-3xl font-semibold tracking-[-0.03em] sm:text-5xl lg:text-6xl text-foreground">
            Artwork Care Guide
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Handcrafted traditional Indian paintings are living heritage. With mindful framing, lighting, and dusting, your collection will remain lustrous for generations.
          </p>
        </div>
      </section>

      {/* Main Guides */}
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 space-y-10">
        
        {/* Universal Preservation Rules */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <div className="flex items-center gap-3 text-primary mb-3">
            <Shield className="size-5" />
            <h2 className="font-serif text-xl font-semibold text-foreground">
              3 Golden Rules for Handcrafted Art
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 text-sm text-muted-foreground">
            <div className="rounded-xl border border-border/80 bg-background/80 p-4">
              <span className="font-semibold text-foreground block mb-1">1. Indirect Lighting</span>
              Display under warm LED lights (2700K–3500K) or diffuse natural light; avoid harsh direct UV rays.
            </div>
            <div className="rounded-xl border border-border/80 bg-background/80 p-4">
              <span className="font-semibold text-foreground block mb-1">2. Zero Moisture</span>
              Keep away from direct steam, open monsoon windows, or damp wall seepage.
            </div>
            <div className="rounded-xl border border-border/80 bg-background/80 p-4">
              <span className="font-semibold text-foreground block mb-1">3. Dry Cleaning Only</span>
              Use only dry, soft microfibers or camel-hair brushes; never spray liquids or solvents.
            </div>
          </div>
        </div>

        {/* Medium Specific Grid */}
        <div className="grid gap-8 sm:grid-cols-2">
          {CARE_GUIDELINES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                  </div>

                  {/* Dos */}
                  <div className="space-y-2 mt-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Recommended Care:
                    </span>
                    <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                      {item.dos.map((d) => (
                        <li key={d} className="flex items-start gap-2">
                          <Check className="size-4 text-primary shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Don'ts */}
                  <div className="space-y-2 mt-4 pt-3 border-t border-border/60">
                    <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
                      Things to Avoid:
                    </span>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                      {item.donts.map((dont) => (
                        <li key={dont} className="flex items-start gap-2">
                          <span className="text-destructive font-bold text-xs shrink-0 mt-0.5">✕</span>
                          <span>{dont}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Framing & Restoration Advice Banner */}
        <div className="rounded-2xl border border-border bg-muted/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Need Framing Guidance or Custom Dimensions?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We provide complimentary recommendations on framing glass, teakwood mountings, and gallery lighting.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={phoneHref}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <PhoneCall className="size-4 text-primary" /> Call the Artist
            </a>
            <a
              href={inquiryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              WhatsApp Us
            </a>
          </div>
        </div>

      </section>
    </div>
  );
}

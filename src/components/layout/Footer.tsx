import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle, PhoneCall, ShieldCheck } from "lucide-react";
import { hasWhatsApp, inquiryHref, phoneHref, siteConfig } from "@/config/site";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const copyrightYear = currentYear > 2025 ? `2025–${currentYear}` : "2025";

  return (
    <footer id="contact" className="border-t border-border bg-muted/35">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.4fr_0.65fr_0.65fr_0.65fr_0.65fr] lg:px-10 lg:py-16">
        {/* Brand & Direct Contact */}
        <div className="space-y-4">
          <p className="font-serif text-3xl tracking-[-0.03em] text-foreground">Anjori Arts</p>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            Original Indian art and bespoke commissions, handcrafted with heritage pigments and delivered securely across India.
          </p>

          <div className="flex flex-col gap-2.5 text-sm font-medium text-primary pt-2">
            <a
              href={inquiryHref}
              target={hasWhatsApp ? "_blank" : undefined}
              rel={hasWhatsApp ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 hover:underline"
            >
              <MessageCircle className="size-4 shrink-0" /> {hasWhatsApp ? "WhatsApp: +91 80519 60916" : "WhatsApp Inquiry"}
            </a>
            <a href={phoneHref} className="inline-flex items-center gap-2 hover:underline">
              <PhoneCall className="size-4 shrink-0" /> Call: {siteConfig.phone}
            </a>
            <a href={`mailto:${siteConfig.email.support}`} className="inline-flex items-center gap-2 hover:underline">
              <Mail className="size-4 shrink-0" /> {siteConfig.email.support}
            </a>
          </div>

          {/* Secure Payment & Trust Badge */}
          <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/80 px-3.5 py-2 text-xs text-muted-foreground shadow-xs mt-2">
            <ShieldCheck className="size-4 text-primary shrink-0" />
            <span>
              100% Secure Checkout via <strong className="font-semibold text-foreground">Razorpay</strong>
            </span>
          </div>
        </div>

        {/* Discover */}
        <div>
          <p className="aa-eyebrow">Discover</p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
            <Link href="/shop" className="hover:text-primary transition-colors">Shop Artworks</Link>
            <Link href="/custom-order" className="hover:text-primary transition-colors">Custom Commissions</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
            <Link href="/categories" className="hover:text-primary transition-colors">Art Traditions</Link>
          </div>
        </div>

        {/* Customer Support */}
        <div>
          <p className="aa-eyebrow">Customer Care</p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
            <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            <Link href="/shipping" className="hover:text-primary transition-colors">Shipping &amp; Delivery</Link>
            <Link href="/returns" className="hover:text-primary transition-colors">Returns &amp; Refunds</Link>
            <Link href="/care" className="hover:text-primary transition-colors">Artwork Care Guide</Link>
            <Link href="/faq" className="hover:text-primary transition-colors">Frequently Asked Questions</Link>
          </div>
        </div>

        {/* Legal & Governance */}
        <div>
          <p className="aa-eyebrow">Legal &amp; Policy</p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms &amp; Conditions</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>

        {/* Social Links */}
        <div>
          <p className="aa-eyebrow">Follow Along</p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
            <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
              Instagram <ArrowUpRight className="size-3.5" />
            </a>
            <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
              Facebook <ArrowUpRight className="size-3.5" />
            </a>
            <a href={siteConfig.social.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
              YouTube <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-5 py-5 text-center text-xs text-muted-foreground sm:px-8">
        Copyright © {copyrightYear} Anjori Arts. Handcrafted with pride in India.
      </div>
    </footer>
  );
}

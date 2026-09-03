import type { Metadata } from "next";
import { FAQAccordionList } from "@/components/shared/FAQAccordionList";
import { siteConfig, phoneHref, inquiryHref } from "@/config/site";
import { HelpCircle, Mail, MessageCircle, PhoneCall, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ)",
  description:
    "Got questions about custom art commissions, 22K gold foil authenticity, framing, domestic shipping, or secure payments via Razorpay? Find all answers here.",
  alternates: {
    canonical: `${siteConfig.url}/faq`,
  },
  openGraph: {
    title: "Frequently Asked Questions | Anjori Arts",
    description:
      "All answers about handcrafted Indian paintings, bespoke custom commissions, transit protection, and secure payments.",
    url: `${siteConfig.url}/faq`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
};

const FAQ_ITEMS = [
  {
    category: "Art Authenticity & Craft",
    items: [
      {
        question: "Are all paintings genuinely handmade?",
        answer:
          "Yes, 100%. Every single painting is created completely by hand from scratch by our traditional master artists. We do not sell digital prints, machine reproductions, or hybrid canvas print-overs. Each artwork comes with a signed Certificate of Authenticity specifying the art tradition, surface, and medium.",
      },
      {
        question: "Is real 22K gold foil used in Tanjore & Pichwai artworks?",
        answer:
          "Yes. For our Tanjore and ceremonial Pichwai collections, we strictly use certified 22-karat genuine gold foil sheets applied over traditional chalk-gesso relief (Muckwork) on seasoned teakwood or marine-grade boards. This ensures the luster endures for generations without tarnishing.",
      },
      {
        question: "What pigments and mediums do you use for Madhubani art?",
        answer:
          "For authentic traditional feel, we work with both natural mineral & plant-extracted dyes as well as artist-grade acrylic inks on acid-free handmade paper and pure tussar silk. Fine line work is executed using fine bamboo nibs and fine-tip brushes.",
      },
    ],
  },
  {
    category: "Custom Commissions",
    items: [
      {
        question: "How do custom artwork commissions work?",
        answer:
          "You can share your desired theme, reference image, color palette, and wall dimensions via our Custom Order form or directly on WhatsApp. We provide an exact quote and preview sketch before commencing. During creation, we share milestone progress photos for your feedback and approval before final varnish and dispatch.",
      },
      {
        question: "How long does a custom painting take to complete?",
        answer:
          "Depending on size and complexity: Small & Medium Madhubani/Warli works take 7–10 days; intricate 22K gold Tanjore or large canvas Pichwai works require 14–21 days. If you have an urgent deadline (anniversary, housewarming, corporate gifting), reach out to us and we will accommodate where possible.",
      },
    ],
  },
  {
    category: "Payments & Security",
    items: [
      {
        question: "How secure is the checkout process?",
        answer:
          "All online payments are processed via Razorpay with 256-bit SSL encryption and full RBI compliance. We accept UPI (Google Pay, PhonePe, Paytm, BHIM), all Credit/Debit Cards (Visa, Mastercard, RuPay), NetBanking from 50+ banks, and popular wallets. We never store your card or bank credentials.",
      },
      {
        question: "Do you offer Cash on Delivery (COD)?",
        answer:
          "Because authentic handmade artwork and custom commissions involve custom dimensions, delicate packaging, and high transit value, we do not support COD. Full transit insurance and 100% money-back guarantee against transit damage are included with all prepaid orders.",
      },
    ],
  },
  {
    category: "Shipping & Transit Safety",
    items: [
      {
        question: "How do you package delicate paintings for long-distance transit?",
        answer:
          "We follow museum unboxing standards: acid-free glassine sheets cover the paint surface, followed by waterproof thermal wrapping, corner guard cushions, shock-absorbing bubble foam, and a heavy-gauge rigid corrugated crate or high-density mailing tube.",
      },
      {
        question: "What happens if a parcel arrives damaged in transit?",
        answer:
          "All our shipments are 100% transit-insured. In the rare event of transit damage, simply send us an unboxing photo/video within 24 hours of delivery. We will immediately arrange a complimentary priority re-creation or initiate a full 100% refund.",
      },
      {
        question: "Do you ship paintings with frames?",
        answer:
          "Standard artworks are shipped securely rolled in rigid PVC/cylinder tubes or flat-crated to prevent glass shatter risk during courier transit. Selected Tanjore paintings come with traditional South Indian Chettinad teakwood frames fitted with acrylic safety glass.",
      },
    ],
  },
];

export default function FAQPage() {
  const allQuestions = FAQ_ITEMS.flatMap((category) => category.items);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allQuestions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Schema.org FAQ Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header Section */}
      <section className="aa-hero-grid border-b border-border/80 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow inline-block mb-3">Clear Answers</span>
          <h1 className="font-serif text-3xl font-semibold tracking-[-0.03em] sm:text-5xl lg:text-6xl text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Everything you need to know about our authentic handcrafting process, custom sizing, payments with Razorpay, and insured nationwide delivery.
          </p>
        </div>
      </section>

      {/* FAQ Categories Section */}
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <FAQAccordionList groups={FAQ_ITEMS} />

        {/* Razorpay Trust Box */}
        <div className="mt-14 rounded-2xl border border-border bg-gradient-to-br from-card via-card to-muted/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Secure Payments via Razorpay
            </h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Every checkout is protected by bank-level 256-bit encryption. UPI (Google Pay, PhonePe, Paytm), Visa/Mastercard/RuPay cards, and direct NetBanking are supported with instant digital invoices.
            </p>
          </div>
        </div>

        {/* Still Have Questions CTA */}
        <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-10 text-center">
          <HelpCircle className="mx-auto size-8 text-primary mb-3" />
          <h3 className="font-serif text-2xl font-semibold text-foreground">
            Still have a question or need advice?
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground leading-relaxed">
            Reach out directly to the studio artist. We are happy to help with custom dimensions, wall color recommendations, and gift ideas.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={inquiryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
            >
              <MessageCircle className="size-4" /> Chat on WhatsApp
            </a>
            <a href={`tel:${siteConfig.phone.replace(/[^0-9+]/g, '')}`} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-xs">
              <PhoneCall className="size-4 text-primary" /> Call +91 80519 60916
            </a>
            <a
              href={`mailto:${siteConfig.email.support}`}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
            >
              <Mail className="size-4 text-primary" /> Email Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

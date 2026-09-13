import type { Metadata } from "next";
import { FAQAccordionList } from "@/components/shared/FAQAccordionList";
import { siteConfig, inquiryHref } from "@/config/site";
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
      {
        question: "Can I visit your studio in person?",
        answer:
          "Anjori Arts operates as an online studio based in Puducherry, India. Because our artists work on delicate pigment preparation, natural dyes, and fragile gold leaf in a focused workshop setting, we do not host walk-in visits. However, we provide high-resolution photos, videos, and personalized WhatsApp consultations to help you select your artwork.",
      },
    ],
  },
  {
    category: "Framing Options",
    items: [
      {
        question: "Are artworks sold framed or unframed?",
        answer:
          "Framing is completely optional! Depending on the artwork, you can choose to receive it Unframed (safely rolled in rigid PVC mailing tubes or flat-packed) or select framing (Basic or Premium framing fitted with protective acrylic glass). The framing availability and price are dynamically configured on each artwork's product page.",
      },
      {
        question: "Why do you use acrylic glass instead of standard glass for framed shipments?",
        answer:
          "Standard glass is heavy and prone to shattering during courier transit, which can severely tear or scratch the underlying painting. We use premium museum-grade shatter-resistant acrylic glass that provides superior optical clarity, UV protection, and safe transit.",
      },
    ],
  },
  {
    category: "Shipping & Worldwide Delivery",
    items: [
      {
        question: "What are your dispatch and delivery timelines?",
        answer:
          "In-stock artworks are prepared, inspected, and dispatched within 4–5 business days. Transit delivery takes 4–7 business days post-dispatch depending on your delivery location. If you have an urgent date (such as a birthday, anniversary, or housewarming), please contact us beforehand and we will do our best to accommodate express processing.",
      },
      {
        question: "How long does a custom commissioned painting take?",
        answer:
          "Custom-dimension and personalized paintings require 7–21 days of handcrafted preparation depending on the complexity, detail, and surface drying times (such as Tanjore gesso or multi-layer natural pigments). Delivery takes an additional 4–7 business days after dispatch.",
      },
      {
        question: "What are the shipping charges?",
        answer:
          "All pan-India orders of ₹1,999 and above enjoy complimentary free insured delivery. For orders below ₹1,999, a flat shipping fee of ₹150 is applied at checkout.",
      },
      {
        question: "Which courier partners do you use?",
        answer:
          "We partner with reputable express couriers including Blue Dart, Delhivery, DTDC, Shiprocket, and India Post (Speed Post) to ensure reliable, insured, door-to-door delivery across India.",
      },
      {
        question: "Do you ship worldwide / internationally?",
        answer:
          "Yes! We ship worldwide to international art collectors across the USA, UK, UAE, Europe, Australia, Singapore, and beyond. International orders are handled on prepaid terms via WhatsApp (+91 80519 60916) or Email (support@anjoriarts.com). Shipping mode, customs documentation, and carrier rates depend on the destination country and dimensions.",
      },
    ],
  },
  {
    category: "Returns & Damage Protection",
    items: [
      {
        question: "What happens if a parcel arrives damaged in transit?",
        answer:
          "All our shipments are 100% transit-insured. In the rare event of damage, you must record a continuous uncut unboxing video while opening the parcel and share it with us within 24 hours of delivery on WhatsApp (+91 80519 60916) or email. A video recording is mandatory to substantiate courier damage claims. Upon verification, we immediately arrange a complimentary priority re-creation or a 100% refund.",
      },
      {
        question: "What is your return policy for ready-to-ship artworks?",
        answer:
          "Generic, catalog ready-to-ship paintings and handcrafted earrings can be returned or replaced within 7 days of delivery, provided the artwork is unused, in original condition, and packed securely in its original packaging. For non-damaged returns or exchanges, the return courier shipping charge is borne by the customer.",
      },
      {
        question: "Can I return a custom commissioned artwork?",
        answer:
          "Custom-dimension paintings and personalized creations are made specifically to your specifications. We provide milestone preview photos for your review and approval before final varnishing. Once approved and dispatched, custom orders are non-returnable and non-refundable, except for transit damage substantiated with a 24-hour unboxing video.",
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

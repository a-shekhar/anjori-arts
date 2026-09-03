import type { Metadata } from "next";
import { hasWhatsApp, phoneHref, siteConfig } from "@/config/site";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Anjori Arts for custom orders, inquiries, or any questions about our handmade art.",
  alternates: {
    canonical: `${siteConfig.url}/contact`,
  },
  openGraph: {
    title: "Contact Us | Anjori Arts",
    description:
      "Get in touch with Anjori Arts for custom orders, inquiries, or any questions about our handmade art.",
    url: `${siteConfig.url}/contact`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-muted/30 px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow inline-block mb-3">Get in Touch</span>
          <h1 className="font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl lg:text-7xl text-foreground leading-[1.1]">
            We&apos;d love to hear from you.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Whether you have a question about our artworks, want to commission a custom piece, or simply want to say hello, we are here for you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          {/* Contact Details */}
          <div className="space-y-10">
            <div>
              <h2 className="font-serif text-3xl font-medium tracking-[-0.02em] text-foreground mb-6">
                Contact Information
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base">
                Fill out the form and our team will get back to you within 24 hours. We are also available via email or phone.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <Mail className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Email</h3>
                  <p className="text-muted-foreground text-sm mt-1 mb-2">Our friendly team is here to help.</p>
                  <a href={`mailto:${siteConfig.email.support}`} className="text-primary hover:underline font-medium">
                    {siteConfig.email.support}
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <Phone className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Phone & WhatsApp</h3>
                  <p className="text-muted-foreground text-sm mt-1 mb-3">Monday - Sunday: 10:00 AM - 6:00 PM (IST)</p>
                  <div className="flex flex-col gap-2">
                    {hasWhatsApp && (
                      <a href={siteConfig.social.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-sm">
                        <MessageCircle className="size-4 shrink-0" /> WhatsApp us
                      </a>
                    )}
                    <a href={phoneHref} className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-sm">
                      <Phone className="size-4 shrink-0" /> Call {siteConfig.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <Clock className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Working Hours</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Monday - Saturday: 10:00 AM - 6:00 PM (IST)<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
              
              {/* Optional: Location if they have one, I will omit it for now since it is not in siteConfig, or maybe put a generic online store text */}
              <div className="flex gap-4 items-start">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Location</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    We operate online and ship worldwide. Studio visits are by appointment only.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
            <h2 className="font-serif text-2xl font-medium tracking-[-0.02em] text-foreground mb-8">
              Send us a Message
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}

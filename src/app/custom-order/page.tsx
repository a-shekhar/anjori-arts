import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { CommissionForm } from "@/components/forms/commission-form";
import { Paintbrush, Clock, CheckCircle2, HeartHandshake } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MEDIUMS } from "@/config/constants";

export const metadata: Metadata = {
  title: "Custom Orders & Commissions",
  description:
    "Request a custom handmade artwork from Anjori Arts. We work closely with you to bring your vision to life.",
  alternates: {
    canonical: `${siteConfig.url}/custom-order`,
  },
  openGraph: {
    title: "Custom Orders | Anjori Arts",
    description:
      "Request a custom handmade artwork from Anjori Arts. We work closely with you to bring your vision to life.",
    url: `${siteConfig.url}/custom-order`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
};

interface CustomOrderPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CustomOrderPage({ searchParams }: CustomOrderPageProps) {
  const resolvedParams = await searchParams;
  const prefillTitle = typeof resolvedParams.title === 'string' ? resolvedParams.title : undefined;
  const prefillType = typeof resolvedParams.type === 'string' ? resolvedParams.type : undefined;
  const artworkId = typeof resolvedParams.artworkId === 'string' ? resolvedParams.artworkId : undefined;

  const supabase = await createClient();

  let [categoriesRes, surfacesRes, mediumsRes] = await Promise.all([
    supabase.from("categories").select("name").order("display_order", { ascending: true }).order("name"),
    supabase.from("surfaces").select("name").order("display_order"),
    supabase.from("mediums").select("name").order("name", { ascending: true }),
  ]);

  if (categoriesRes.error && categoriesRes.error.code === "42703") {
    categoriesRes = await supabase.from("categories").select("name").order("name");
  }

  const categoryOptions = categoriesRes.data?.map((c) => c.name) || [];
  const surfaceOptions = surfacesRes.data?.map((s) => s.name) || [];
  const mediumOptions =
    mediumsRes.data && mediumsRes.data.length > 0
      ? mediumsRes.data.map((m) => m.name)
      : ["Acrylic", "Oil"];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-muted/30 px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow inline-block mb-3">Custom Orders</span>
          <h1 className="font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl lg:text-7xl text-foreground leading-[1.1]">
            Bring your vision to life.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Looking for something unique? We offer custom commissions tailored to your specific style, size, and budget requirements. Let&apos;s create something beautiful together.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          {/* Commission Details */}
          <div className="space-y-10">
            <div>
              <h2 className="font-serif text-3xl font-medium tracking-[-0.02em] text-foreground mb-6">
                How it works
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base">
                Commissioning an artwork is a collaborative and exciting process. Here&apos;s what you can expect when you order a custom piece.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <Paintbrush className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">1. Consultation & Quote</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    Fill out the inquiry form with your ideas, preferred size, and budget. We will get back to you within 48 hours to discuss the details and provide a quote.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <HeartHandshake className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">2. Sketch & Approval</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    Once the 50% deposit is paid, we&apos;ll create initial sketches or concepts. You&apos;ll have the opportunity to provide feedback before the final painting begins.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <Clock className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">3. Creation</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    The creation process typically takes 2-4 weeks depending on the complexity and size. We&apos;ll share progress photos along the way.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">4. Delivery</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    After final approval and remaining payment, your custom artwork will be carefully packaged and shipped to your doorstep.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10 h-fit sticky top-24">
            <h2 className="font-serif text-2xl font-medium tracking-[-0.02em] text-foreground mb-8">
              Start your commission
            </h2>
            <CommissionForm 
              categories={categoryOptions} 
              mediums={mediumOptions}
              surfaces={surfaceOptions} 
              defaultCategory={prefillType}
              defaultDetails={prefillTitle ? `I am interested in a custom size for "${prefillTitle}".\n\n` : undefined}
              artworkId={artworkId}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

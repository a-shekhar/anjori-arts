import type { Metadata } from "next";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Paintbrush, HandHeart, History } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Story & Mission",
  description:
    "Learn about Anjori Arts, our mission to preserve authentic Indian handmade art, and the story behind our craft.",
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
  openGraph: {
    title: "Our Story & Mission | Anjori Arts",
    description:
      "Discover the mission and story of Anjori Arts, preserving living traditions through authentic handmade Indian art.",
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
};

const VALUES = [
  {
    title: "Living Heritage",
    description: "Every stroke and color choice is rooted in centuries-old traditions like Madhubani, Tanjore, and Warli, preserving techniques passed down through generations.",
    icon: History,
  },
  {
    title: "Authentic & Handmade",
    description: "We completely eschew digital prints and mass reproductions. Each piece is painted slowly and meticulously by hand, ensuring your art is truly one-of-a-kind.",
    icon: Paintbrush,
  },
  {
    title: "Bespoke & Conceptual",
    description: "From custom branding and logo concepts to lifelike portraiture, we collaborate closely to bring your unique vision to life through art and design.",
    icon: HandHeart,
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="aa-hero-grid border-b border-border/80 px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow inline-block mb-3">Artist Story &amp; Mission</span>
          <h1 className="font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl lg:text-7xl text-foreground leading-[1.1]">
            Where Indian heritage meets bespoke design.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            We preserve the slow, traditional art of India while crafting modern branding, portraiture, and custom concepts tailored for today&apos;s spaces.
          </p>
        </div>
      </section>

      {/* Story Content */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20 items-center">
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-medium tracking-[-0.02em] sm:text-4xl text-foreground">
              The Journey of Anjori Arts
            </h2>
            <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
              <p>
                Founded by artist Jyotsna Sharma, Anjori Arts was born from a profound respect for the vibrant, meaningful art forms that have defined Indian culture for centuries. What began as a journey to preserve traditional Indian folk art has evolved into a versatile creative studio bridging the gap between historical heritage and contemporary design.
              </p>
              <p>
                Our expertise spans a wide spectrum. On one hand, we meticulously craft striking Madhubani narratives, rich 22K gold-foiled Tanjore devotionals, intricate Mandala art, and handmade clay earrings. On the other, our contemporary practice brings bespoke visions to life through custom branding, logo concepts, lifelike portraiture, and unique cyanotype prints.
              </p>
              <p>
                Whether you are a collector seeking a piece of living tradition for your home, or a business conceptualizing a completely new brand identity, we collaborate closely with you. We celebrate the slight imperfections of the handmade, the earthy tones of natural pigments, and the power of art to tell your exact story.
              </p>
            </div>
          </div>
          
          <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square overflow-hidden rounded-[2rem] border border-border bg-muted/40 shadow-sm">
             <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent mix-blend-multiply" />
             <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 font-serif">
                <span className="text-sm tracking-widest uppercase">Close-up of Artwork</span>
             </div>
          </div>
        </div>
      </section>

      {/* Brand Motif Section */}
      <section className="border-t border-border/80">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <span className="aa-eyebrow inline-block">Our Emblem</span>
            <h2 className="font-serif text-3xl font-medium tracking-[-0.02em] sm:text-4xl text-foreground">
              The Meaning of Anjori
            </h2>
          </div>
          
          <div className="relative size-40 sm:size-56 overflow-hidden rounded-full shadow-lg transition-transform duration-500 hover:scale-110 cursor-crosshair border-4 border-muted/50">
            <Image src="/logo.jpg" alt="Anjori Arts Logo" fill className="object-cover" />
          </div>
          
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            The name <em>Anjori</em> translates to &quot;moonlight&quot; or &quot;shining light.&quot; Our emblem reflects this through a classic Madhubani depiction of Surya (the Sun) and Chandra (the Moon). Together, they represent divine radiance, harmony, and the timeless nature of the art we preserve. 
          </p>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-3xl font-medium tracking-[-0.02em] sm:text-4xl text-foreground">
              Our Guiding Principles
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3 sm:gap-12">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <article key={value.title} className="text-center sm:text-left flex flex-col items-center sm:items-start">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

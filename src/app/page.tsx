import Link from "next/link";
import Image from "next/image";
import { ArrowDownRight, ArrowRight, Check, MessageCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { hasWhatsApp, inquiryHref, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { ArtworkCard } from "@/components/shared/ArtworkCard";
import type { Artwork, Category } from "@/data/dummy";
import { fetchBlogPosts } from "@/actions/blog";
import { formatDate } from "@/lib/helpers";

const practices = [
  {
    number: "01",
    title: "Art with a point of view",
    text: "Traditional forms, made personal. Each commission begins with the room, story, and occasion it is created for.",
  },
  {
    number: "02",
    title: "Made entirely by hand",
    text: "No printed reproductions. Every line, layer, and embellishment is made slowly by an artist.",
  },
  {
    number: "03",
    title: "A thoughtful delivery",
    text: "We help you choose the surface, scale, frame, and safe transit for a piece that feels at home from day one.",
  },
];

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch Categories
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  
  const allCategories = categoriesData || [];
  // For the homepage, we only want to feature the top 3 to maintain a premium feel.
  const categories = allCategories.slice(0, 3);

  // Fetch Featured Artworks
  const { data: artworksData } = await supabase
    .from("artworks")
    .select("*, category:categories(*)")
    .eq("is_featured", true)
    .limit(4);
    
  // We need to map the joined category into the format expected by ArtworkCard, 
  // but ArtworkCard expects `artwork` to have `isAvailable` (camelCase) while DB has `is_available` (snake_case).
  // Wait, let's look at `ArtworkCard` in `src/components/shared/ArtworkCard.tsx`.
  // It uses `artwork.isAvailable`, `artwork.images[0]`, `artwork.slug`, `artwork.title`, `artwork.dimensions`, `artwork.surface`, `artwork.price`.
  // The DB has `is_available`. Let's map it.
  const featuredArtworks = (artworksData || []).map(art => ({
    ...art,
    isAvailable: art.is_available,
    isFeatured: art.is_featured,
  }));

  // Fetch Latest Blog Posts
  const { posts: latestPosts } = await fetchBlogPosts({ page: 1, limit: 3, sort: "newest" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        email: siteConfig.email.support,
        telephone: siteConfig.phone,
        sameAs: [
          siteConfig.social.instagram,
          siteConfig.social.facebook,
          siteConfig.social.youtube,
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        publisher: { "@id": `${siteConfig.url}/#organization` },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="overflow-hidden">
        <section className="aa-hero-grid border-b border-border">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:gap-20 lg:px-10">
            <div className="max-w-xl">
              <p className="aa-eyebrow">Anjori Arts / Traditional art & bespoke design</p>
              <h1 className="mt-5 font-serif text-4xl font-medium leading-[1.04] tracking-[-0.035em] text-foreground sm:text-6xl lg:text-7xl">
                Art that carries a little more meaning.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                Bespoke Indian paintings and keepsakes, made with the patience of tradition and a place in your home in mind.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  href={inquiryHref}
                  target={hasWhatsApp ? "_blank" : undefined}
                  rel={hasWhatsApp ? "noopener noreferrer" : undefined}
                  className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-full px-6 text-sm shadow-none")}
                >
                  Begin a commission <ArrowRight className="size-4" />
                </a>
                <a
                  href="#traditions"
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline decoration-border underline-offset-8 transition-colors hover:text-primary hover:decoration-primary"
                >
                  Explore the collection <ArrowDownRight className="size-4" />
                </a>
              </div>

              <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2"><Check className="size-4 text-primary" /> Hand-painted originals</span>
                <span className="inline-flex items-center gap-2"><Check className="size-4 text-primary" /> Made to your dimensions</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-2xl">
              <div className="aa-hero-art relative aspect-[1.05] overflow-hidden rounded-[2rem] border border-black/5 bg-secondary shadow-[0_24px_60px_-36px_rgba(43,41,38,0.45)] sm:aspect-[1.2]">
                <div className="aa-hero-sun" />
                <div className="aa-hero-river" />
                <div className="aa-hero-arch aa-hero-arch-one" />
                <div className="aa-hero-arch aa-hero-arch-two" />
                <div className="aa-hero-stem aa-hero-stem-one" />
                <div className="aa-hero-stem aa-hero-stem-two" />
                <p className="absolute bottom-6 left-6 font-serif text-xl text-white/90 sm:bottom-8 sm:left-8 sm:text-2xl">A study in belonging</p>
              </div>
              <div className="absolute -bottom-7 -left-3 hidden w-48 rounded-2xl border border-border bg-background p-4 shadow-lg sm:block">
                <p className="aa-eyebrow text-[10px]">Made to order</p>
                <p className="mt-2 font-serif text-lg text-foreground">Your story, in colour.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Artworks Section */}
        {featuredArtworks.length > 0 && (
          <section id="featured-artworks" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <p className="aa-eyebrow">Featured Artworks</p>
                <h2 className="mt-4 font-serif text-3xl leading-tight tracking-[-0.025em] sm:text-5xl">Curated for your space.</h2>
              </div>
              <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                View all artworks <ArrowRight className="size-4" />
              </Link>
            </div>
            
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredArtworks.map((artwork: Artwork & { category?: Category }) => (
                <ArtworkCard key={artwork.id} artwork={artwork} category={artwork.category} />
              ))}
            </div>
          </section>
        )}

        <section id="approach" className="border-y border-border bg-muted/55">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
              <div>
                <p className="aa-eyebrow">The Anjori approach</p>
                <h2 className="mt-4 font-serif text-3xl leading-tight tracking-[-0.025em] sm:text-5xl">
                  A quieter way to collect art.
                </h2>
              </div>
              <div className="grid gap-8 sm:grid-cols-3 sm:gap-5">
                {practices.map((practice) => (
                  <article key={practice.number} className="border-t border-border/50 pt-5">
                    <p className="text-xs font-semibold tracking-[0.16em] text-primary">{practice.number}</p>
                    <h3 className="mt-5 font-serif text-2xl leading-tight">{practice.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{practice.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="traditions" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="aa-eyebrow">Art traditions</p>
              <h2 className="mt-4 font-serif text-3xl leading-tight tracking-[-0.025em] sm:text-5xl">Rooted in living traditions.</h2>
            </div>
            <Link href="#commission" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              Discuss an artwork <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`} className="group block">
                {category.cover_image ? (
                  <div className="relative aspect-[0.92] overflow-hidden rounded-[1.5rem] border border-black/5">
                     <Image 
                        src={category.cover_image} 
                        alt={category.name} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-105" 
                     />
                  </div>
                ) : (
                  <div className={`aa-art-card aa-art-card-${category.slug} aspect-[0.92] rounded-[1.5rem] border border-black/5 transition-transform duration-300 group-hover:-translate-y-1`} />
                )}
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl">{category.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{category.description}</p>
                  </div>
                  <ArrowDownRight className="mt-1 size-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
          {categories.every(c => !c.cover_image) && (
            <p className="mt-7 text-xs leading-5 text-muted-foreground text-center">Artwork visuals are design studies while the original collection photography is being prepared.</p>
          )}

          <div className="mt-12 flex justify-center">
            <Link 
              href="/shop" 
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8")}
            >
              Explore all {allCategories.length} art traditions
            </Link>
          </div>
        </section>

        <section id="commission" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="aa-commission-panel grid overflow-hidden rounded-[2rem] border border-border lg:grid-cols-[1fr_0.9fr]">
            <div className="p-8 sm:p-12 lg:p-16">
              <p className="aa-eyebrow">Custom commissions</p>
              <h2 className="mt-4 max-w-lg font-serif text-3xl leading-tight tracking-[-0.025em] sm:text-5xl">
                A piece that feels made for your space.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
                Share an idea, a room photograph, or simply a feeling. We will guide the style, scale, medium, and framing.
              </p>
              <a
                href={inquiryHref}
                target={hasWhatsApp ? "_blank" : undefined}
                rel={hasWhatsApp ? "noopener noreferrer" : undefined}
                className={cn(buttonVariants({ size: "lg" }), "mt-8 h-12 rounded-full px-6 text-sm shadow-none")}
              >
                <MessageCircle className="size-4" /> {hasWhatsApp ? "Chat with the artist" : "Email the artist"}
              </a>
            </div>
            <div className="aa-commission-art min-h-72" aria-hidden="true" />
          </div>
        </section>

        {/* Latest Blog Posts Section */}
        {latestPosts.length > 0 && (
          <section id="latest-stories" className="border-t border-border bg-muted/55">
            <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div className="max-w-2xl">
                  <p className="aa-eyebrow">Journal</p>
                  <h2 className="mt-4 font-serif text-3xl leading-tight tracking-[-0.025em] sm:text-5xl">Latest stories & updates.</h2>
                </div>
                <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  Read all articles <ArrowRight className="size-4" />
                </Link>
              </div>

              <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {latestPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                    <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-border">
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-4">
                      <p className="mb-2 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                        {formatDate(post.published_at || post.created_at)}
                      </p>
                      <h3 className="font-serif text-xl group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

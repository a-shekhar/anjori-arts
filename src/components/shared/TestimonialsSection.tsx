import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, Quote, PlusCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  showShareButton?: boolean;
}

export function TestimonialsSection({
  testimonials,
  title = "Art in living spaces.",
  subtitle = "Read how our hand-painted traditions and bespoke commissions find their home in living spaces across the country.",
  eyebrow = "Collector stories",
  showShareButton = true,
}: TestimonialsSectionProps) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section id="collector-stories" className="border-t border-border bg-muted/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="aa-eyebrow">{eyebrow}</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight tracking-[-0.025em] sm:text-5xl">
              {title}
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {showShareButton && (
              <Link
                href="/share-story"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-10 rounded-full px-4 text-xs font-medium"
                )}
              >
                <PlusCircle className="mr-1.5 size-3.5" /> Share your story
              </Link>
            )}
            <Link
              href="/stories"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              All collector stories <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col justify-between rounded-[2rem] border border-border bg-card p-6 sm:p-7 shadow-xs transition-shadow duration-300 hover:shadow-md"
            >
              <div>
                {/* Optional Room Photo */}
                {item.image_url && (
                  <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-secondary">
                    <Image
                      src={item.image_url}
                      alt={item.image_alt || `Artwork in ${item.author_name}'s home`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}

                {/* Rating Stars */}
                <div className="flex items-center gap-1" aria-label={`Rated ${item.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-4",
                        i < item.rating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>

                {/* Artwork Title Tag */}
                {item.artwork_title && (
                  <p className="mt-3 text-xs font-medium tracking-wide text-primary">
                    {item.artwork_title}
                  </p>
                )}

                {/* Quote */}
                <div className="relative mt-3">
                  <Quote className="absolute -left-1 -top-2 size-6 -scale-x-100 text-muted-foreground/15" />
                  <p className="relative text-sm leading-relaxed text-foreground/90 sm:text-base">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>
              </div>

              {/* Author Details Footer */}
              <div className="mt-6 border-t border-border/60 pt-4">
                <p className="font-serif text-base font-medium text-foreground">
                  {item.author_name}
                </p>
                {item.author_location && (
                  <p className="text-xs text-muted-foreground">
                    {item.author_location}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


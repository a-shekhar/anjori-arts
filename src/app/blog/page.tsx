import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BlogList } from "@/components/shared/BlogList";

export const metadata: Metadata = {
  title: "Blog - Anjori Arts",
  description: "Read the latest news, stories, and insights about traditional Indian art forms.",
};

export default async function BlogListingPage() {
  const supabase = await createClient();
  const { data: posts, count } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact" })
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .range(0, 11); // Initial 12 posts

  // Fallback to empty array if no posts found
  const blogPosts = posts || [];

  return (
    <div className="min-h-screen bg-background">
      <section className="aa-hero-grid border-b border-border/80 px-5 py-16 sm:px-8 sm:py-24 lg:px-10 mb-12 sm:mb-16">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow inline-block mb-3">Journal &amp; News</span>
          <h1 className="font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl lg:text-7xl text-foreground leading-[1.1]">
            Our Blog
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Discover stories about traditional Indian art forms, artist spotlights, and cultural heritage.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 pb-16 sm:pb-24">
        {/* @ts-ignore - Supabase type mismatch with BlogList */}
        <BlogList initialPosts={blogPosts} initialCount={count || 0} />
      </div>
    </div>
  );
}


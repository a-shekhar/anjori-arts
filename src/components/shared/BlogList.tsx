"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { fetchBlogPosts } from "@/actions/blog";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  author: string;
  published_at: string;
  tags: string[];
};

type BlogListProps = {
  initialPosts: BlogPost[];
  initialCount: number;
};

const POSTS_PER_PAGE = 12;

export function BlogList({ initialPosts, initialCount }: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [count, setCount] = useState(initialCount);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Simple debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle search and sort change
  useEffect(() => {
    startTransition(async () => {
      const { posts: newPosts, count: newCount } = await fetchBlogPosts({
        page: 1,
        limit: POSTS_PER_PAGE,
        search: debouncedSearch,
        sort,
      });
      setPosts(newPosts as BlogPost[]);
      setCount(newCount);
      setPage(1);
    });
  }, [debouncedSearch, sort]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const { posts: morePosts } = await fetchBlogPosts({
        page: nextPage,
        limit: POSTS_PER_PAGE,
        search: debouncedSearch,
        sort,
      });
      setPosts((prev) => [...prev, ...(morePosts as BlogPost[])]);
      setPage(nextPage);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const hasMore = posts.length < count;

  return (
    <div className="space-y-8">
      {/* ── Toolbar ────────────────────────────────────── */}
      <div className="mb-8 space-y-4">
        {/* Search + Sort Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-label="Search blogs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          
          {/* Sort */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="hidden text-xs text-muted-foreground sm:block whitespace-nowrap">
                Sort by
              </label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
                className="h-10 rounded-xl border border-border bg-card px-3 pr-8 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-muted-foreground">
          {count === 0
            ? "No blogs found"
            : `Showing ${posts.length} of ${count} blog${count !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Grid */}
      <div className="relative min-h-[400px]">
        {isPending && (
          <div className="absolute inset-0 z-50 bg-background/50 flex items-center justify-center rounded-xl backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {posts.length === 0 && !isPending ? (
          <div className="text-center py-20 text-muted-foreground border rounded-xl border-dashed">
            No blog posts found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative group">
                <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10">
                  <span className="sr-only">Read {post.title}</span>
                </Link>
                
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <Image
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                
                <CardHeader className="flex-none pb-2 pt-6">
                  <div className="flex flex-wrap gap-2 mb-3 relative z-20 pointer-events-none">
                    {post.tags.map((tag: string) => (
                      <Badge variant="secondary" key={tag} className="font-normal text-xs pointer-events-auto">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="font-serif text-xl line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2 text-xs">
                    <span>{post.author}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                    <time dateTime={post.published_at}>
                      {new Date(post.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </time>
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 pb-6">
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={loadMore} 
            disabled={isLoadingMore || isPending}
            className="w-full sm:w-auto min-w-[200px]"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

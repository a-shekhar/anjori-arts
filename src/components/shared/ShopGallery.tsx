"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ArtworkCard } from "@/components/shared/ArtworkCard";
import type { Artwork, Category } from "@/types";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

/* ── Constants ───────────────────────────────────────── */
const ITEMS_PER_PAGE = 12;

type SortKey =
  | "featured"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "newest";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "name-asc", label: "Name: A → Z" },
  { value: "name-desc", label: "Name: Z → A" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest First" },
];

const VALID_SORT_KEYS = new Set<SortKey>([
  "featured",
  "name-asc",
  "name-desc",
  "price-asc",
  "price-desc",
  "newest",
]);

/* ── Props ───────────────────────────────────────────── */
interface ShopGalleryProps {
  artworks: Artwork[];
  categories: Category[];
  initialCategory?: string;
  hideCategoryFilter?: boolean;
}

/* ── Component ───────────────────────────────────────── */
export function ShopGallery({ 
  artworks, 
  categories,
  initialCategory = "all",
  hideCategoryFilter = false
}: ShopGalleryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Helper to resolve category param (ID or slug) to ID
  const resolveCategory = useCallback(
    (param: string | null) => {
      if (!param) return null;
      const matched = categories.find(
        (c) => c.id === param || c.slug === param
      );
      return matched ? matched.id : param;
    },
    [categories]
  );

  // Helper to get slug from category ID
  const getCategorySlug = useCallback(
    (id: string) => {
      if (!id || id === "all") return null;
      const matched = categories.find((c) => c.id === id);
      return matched ? matched.slug : id;
    },
    [categories]
  );

  const initialCatResolved = resolveCategory(searchParams.get("category")) || initialCategory;
  const initialSortParam = searchParams.get("sort") as SortKey | null;
  const initialSort = initialSortParam && VALID_SORT_KEYS.has(initialSortParam) ? initialSortParam : "featured";

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState<string>(initialCatResolved);
  const [sortKey, setSortKey] = useState<SortKey>(initialSort);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [showFilters, setShowFilters] = useState(false);

  // Sync state when URL searchParams change externally (e.g. Back/Forward navigation)
  useEffect(() => {
    const urlQ = searchParams.get("q") || "";
    setSearch(urlQ);

    const urlCat = searchParams.get("category");
    if (urlCat) {
      setActiveCategory(resolveCategory(urlCat) || urlCat);
    } else {
      setActiveCategory(initialCategory || "all");
    }

    const urlSort = searchParams.get("sort") as SortKey | null;
    if (urlSort && VALID_SORT_KEYS.has(urlSort)) {
      setSortKey(urlSort);
    } else {
      setSortKey("featured");
    }

    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchParams, resolveCategory, initialCategory]);

  // Helper to update URL search parameters
  const updateUrl = useCallback(
    (updates: { q?: string; category?: string; sort?: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      if ("q" in updates) {
        const val = updates.q?.trim();
        if (val) {
          params.set("q", val);
        } else {
          params.delete("q");
        }
      }

      if ("category" in updates && !hideCategoryFilter) {
        const catId = updates.category;
        if (catId && catId !== "all") {
          const slug = getCategorySlug(catId);
          if (slug) params.set("category", slug);
        } else {
          params.delete("category");
        }
      }

      if ("sort" in updates) {
        const s = updates.sort;
        if (s && s !== "featured" && VALID_SORT_KEYS.has(s as SortKey)) {
          params.set("sort", s);
        } else {
          params.delete("sort");
        }
      }

      const queryString = params.toString();
      const target = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(target, { scroll: false });
    },
    [searchParams, hideCategoryFilter, getCategorySlug, pathname, router]
  );

  // Debounce search query sync to URL (350ms)
  useEffect(() => {
    const currentParam = searchParams.get("q") || "";
    if (search.trim() === currentParam) return;

    const timer = setTimeout(() => {
      updateUrl({ q: search });
    }, 350);

    return () => clearTimeout(timer);
  }, [search, searchParams, updateUrl]);

  /* ── Derived / filtered artworks ───────────────────── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    let result = artworks;

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((a) => a.categoryId === activeCategory);
    }

    // Search (name + tags)
    if (q) {
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          a.medium.toLowerCase().includes(q) ||
          a.surface.toLowerCase().includes(q)
      );
    }

    // Sort
    const sorted = [...result];
    switch (sortKey) {
      case "name-asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        // Reverse the array order (newest = highest id)
        sorted.reverse();
        break;
      case "featured":
      default:
        sorted.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return sorted;
  }, [artworks, search, activeCategory, sortKey]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  }, []);

  const handleCategoryChange = useCallback(
    (catId: string) => {
      setActiveCategory(catId);
      setVisibleCount(ITEMS_PER_PAGE); // reset pagination on filter change
      updateUrl({ category: catId });
    },
    [updateUrl]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setVisibleCount(ITEMS_PER_PAGE);
    },
    []
  );

  const clearSearch = useCallback(() => {
    setSearch("");
    setVisibleCount(ITEMS_PER_PAGE);
    updateUrl({ q: "" });
  }, [updateUrl]);

  const handleSortChange = useCallback(
    (newSort: SortKey) => {
      setSortKey(newSort);
      setVisibleCount(ITEMS_PER_PAGE);
      updateUrl({ sort: newSort });
    },
    [updateUrl]
  );

  const handleResetAll = useCallback(() => {
    setSearch("");
    setActiveCategory("all");
    setSortKey("featured");
    setVisibleCount(ITEMS_PER_PAGE);
    updateUrl({ q: "", category: "all", sort: "featured" });
  }, [updateUrl]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: artworks.length };
    for (const a of artworks) {
      counts[a.categoryId] = (counts[a.categoryId] || 0) + 1;
    }
    return counts;
  }, [artworks]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
      {/* ── Toolbar ────────────────────────────────────── */}
      <div className="mb-8 space-y-4">
        {/* Search + Sort Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by name, tag, medium…"
              className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-label="Search artworks"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Sort + Filter Toggle */}
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            {!hideCategoryFilter && (
              <button
                type="button"
                onClick={() => setShowFilters((p) => !p)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:hidden"
                aria-expanded={showFilters}
                aria-controls="category-filters"
              >
                <SlidersHorizontal className="size-4" />
                Filters
              </button>
            )}

            {/* Sort */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="hidden text-xs text-muted-foreground sm:block whitespace-nowrap">
                Sort by
              </label>
              <select
                id="sort-select"
                value={sortKey}
                onChange={(e) => handleSortChange(e.target.value as SortKey)}
                className="h-10 rounded-xl border border-border bg-card px-3 pr-8 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        {!hideCategoryFilter && (
          <div
            id="category-filters"
            className={`flex flex-wrap gap-2 ${showFilters ? "block" : "hidden sm:flex"}`}
          >
            <button
              type="button"
              onClick={() => handleCategoryChange("all")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              All{" "}
              <span className="ml-1 text-[10px] opacity-70">
                ({categoryCounts.all})
              </span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {cat.name}{" "}
                <span className="ml-1 text-[10px] opacity-70">
                  ({categoryCounts[cat.id] || 0})
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        <p className="text-xs text-muted-foreground">
          {filtered.length === 0
            ? "No artworks found"
            : `Showing ${Math.min(visibleCount, filtered.length)} of ${filtered.length} artwork${filtered.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* ── Grid ───────────────────────────────────────── */}
      {visible.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
          {visible.map((artwork) => {
            const category = categories.find(
              (c) => c.id === artwork.categoryId
            );
            return (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                category={category}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <Search className="mb-4 size-10 text-muted-foreground/40" />
          <h3 className="font-serif text-lg font-semibold text-foreground">
            No artworks match your search
          </h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Try a different keyword, remove filters, or browse all artworks.
          </p>
          <button
            type="button"
            onClick={handleResetAll}
            className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            View All Artworks
          </button>
        </div>
      )}

      {/* ── Load More ──────────────────────────────────── */}
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            className="rounded-xl border border-border bg-card px-8 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 active:scale-[0.98]"
          >
            Load More Artworks
          </button>
        </div>
      )}
    </div>
  );
}


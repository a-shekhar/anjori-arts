"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function NavSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query)}`);
    } else {
      router.push(`/shop`);
    }
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className="hidden relative sm:flex items-center"
    >
      <input
        type="text"
        placeholder="Search artworks..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search artworks"
        className="min-h-[44px] h-11 w-40 md:w-44 lg:w-52 transition-all duration-300 focus:w-48 lg:focus:w-64 rounded-full border border-input bg-transparent pl-4 pr-11 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <button 
        type="submit" 
        aria-label="Submit search"
        className="absolute right-0 top-1/2 -translate-y-1/2 flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Search className="size-4" />
        <span className="sr-only">Search</span>
      </button>
    </form>
  );
}


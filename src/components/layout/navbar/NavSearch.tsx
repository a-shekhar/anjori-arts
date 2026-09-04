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
        className="h-9 w-40 md:w-44 lg:w-52 transition-all duration-300 focus:w-48 lg:focus:w-64 rounded-full border border-input bg-transparent px-4 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <button 
        type="submit" 
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        <Search className="size-4" />
        <span className="sr-only">Search</span>
      </button>
    </form>
  );
}


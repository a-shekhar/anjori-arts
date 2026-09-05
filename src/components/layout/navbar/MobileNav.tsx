"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

export function MobileNav() {
  const isMobileMenuOpen = useUIStore((state) => state.isMobileMenuOpen);
  const toggleMobileMenu = useUIStore((state) => state.toggleMobileMenu);

  return (
    <button
      type="button"
      onClick={toggleMobileMenu}
      className="inline-flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden cursor-pointer active:scale-95"
      aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={isMobileMenuOpen}
    >
      {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
    </button>
  );
}

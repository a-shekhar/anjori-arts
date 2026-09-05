"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, MessageCircle, ShoppingBag, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { NAV_LINKS } from "@/config/navigation";
import { hasWhatsApp, inquiryHref } from "@/config/site";
import { ThemeToggle } from "./ThemeToggle";
import { useUIStore } from "@/stores/ui-store";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

export function MobileDrawer() {
  const isOpen = useUIStore((state) => state.isMobileMenuOpen);
  const close = useUIStore((state) => state.closeMobileMenu);
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.getItemCount());
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Lock body scroll when open
  React.useEffect(() => {
    if (!mounted) return;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen, mounted]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  // Close when route changes
  React.useEffect(() => {
    close();
  }, [pathname, close]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex justify-end md:hidden">
      {/* Backdrop overlay */}
      <div
        onClick={close}
        aria-hidden="true"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      />

      {/* Slide-out Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="relative z-10 flex h-full w-[85vw] max-w-sm flex-col justify-between border-l border-border bg-background p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
      >
        {/* Top Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary font-serif text-lg font-semibold text-primary-foreground shadow-sm">
                A
              </span>
              <div>
                <div className="font-serif text-lg font-semibold tracking-[-0.02em] text-foreground">
                  Anjori Arts
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Indian art, made by hand
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={close}
              aria-label="Close navigation menu"
              className="inline-flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation links">
            <Link
              href="/cart"
              onClick={close}
              className={cn(
                "flex min-h-[44px] items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                pathname === "/cart"
                  ? "bg-muted text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="size-4" aria-hidden="true" />
                <span>Shopping Bag</span>
              </div>
              {mounted && itemCount > 0 ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              ) : (
                <ChevronRight className="size-4 opacity-40" aria-hidden="true" />
              )}
            </Link>

            {NAV_LINKS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "flex min-h-[44px] items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-muted text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="size-4 opacity-40" />
                </Link>
              );
            })}
          </nav>

          {/* Heritage Specialties Pill Cloud */}
          <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Our Specializations
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Mithila / Madhubani",
                "Tanjore 22K Gold",
                "Pichwai",
                "Warli Tribal",
                "Handmade Earrings",
              ].map((art) => (
                <span
                  key={art}
                  className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground/80"
                >
                  {art}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-3 border-t border-border pt-4 mt-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Appearance</span>
            <ThemeToggle />
          </div>
          <a
            href={inquiryHref}
            target={hasWhatsApp ? "_blank" : undefined}
            rel={hasWhatsApp ? "noopener noreferrer" : undefined}
            onClick={close}
            className={cn(
              buttonVariants({ variant: "default" }),
              "min-h-[44px] w-full rounded-xl font-medium shadow-none gap-2"
            )}
          >
            <MessageCircle className="size-4" />
            <span>{hasWhatsApp ? "Start a WhatsApp inquiry" : "Email an inquiry"}</span>
          </a>
        </div>
      </aside>
    </div>
  );
}


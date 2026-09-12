"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { User, Package, MapPin, Heart, Shield, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useWishlistStore } from "@/stores/wishlist-store";

interface NavItem {
  href: string;
  label: string;
  icon: typeof User;
  exact?: boolean;
  badge?: string;
}

const BASE_NAV_ITEMS: NavItem[] = [
  {
    href: "/account",
    label: "Personal Profile",
    icon: User,
    exact: true,
  },
  {
    href: "/account/orders",
    label: "Orders & Acquisitions",
    icon: Package,
  },
  {
    href: "/account/addresses",
    label: "Saved Addresses",
    icon: MapPin,
  },
  {
    href: "/account/wishlist",
    label: "Collector Wishlist",
    icon: Heart,
  },
  {
    href: "/account/security",
    label: "Security & Settings",
    icon: Shield,
  },
];

export function AccountNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const wishlistCount = useWishlistStore((state) => state.getItemCount());

  const navItems = BASE_NAV_ITEMS.map((item) => {
    if (item.href === "/account/wishlist" && isMounted && wishlistCount > 0) {
      return { ...item, badge: `${wishlistCount}` };
    }
    return item;
  });

  function isActive(item: NavItem) {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Mobile Horizontal Scrollable Pills */}
      <div className="flex lg:hidden overflow-x-auto pb-2 scrollbar-none gap-2 -mx-2 px-2">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all shrink-0",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              <Icon className="size-3.5 shrink-0" />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px] uppercase tracking-wider font-semibold",
                    active
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Desktop Vertical Menu */}
      <nav className="hidden lg:flex flex-col gap-1 rounded-2xl border border-border bg-card p-2 shadow-sm">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all",
                active
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-2 py-0.5">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bespoke Art Commissions Card (Desktop only) */}
      <div className="hidden lg:block rounded-2xl border border-border bg-muted/40 p-5 space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Bespoke Artworks</span>
        </div>
        <h3 className="font-serif text-sm font-medium text-foreground">
          Commission a Custom Piece
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Looking for a specific theme or custom size in Madhubani or Tanjore? Collaborate with our master artisans.
        </p>
        <Link href="/custom-order" className="inline-block pt-1">
          <span className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
            <span>Start custom inquiry</span>
            <ArrowRight className="size-3" />
          </span>
        </Link>
      </div>
    </div>
  );
}

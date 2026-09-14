"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { ADMIN_NAV_LINKS } from "@/config/navigation";
import { ExternalLink, LayoutDashboard, Palette, ShoppingBag, Paintbrush, PenTool, FolderTree, Menu, MessageSquareQuote, MessageSquare, Layers, Pipette, Users } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { siteConfig } from "@/config/site";

const ICONS = {
  "/admin": LayoutDashboard,
  "/admin/artworks": Palette,
  "/admin/categories": FolderTree,
  "/admin/surfaces": Layers,
  "/admin/mediums": Pipette,
  "/admin/orders": ShoppingBag,
  "/admin/custom-orders": Paintbrush,
  "/admin/customers": Users,
  "/admin/inquiries": MessageSquare,
  "/admin/testimonials": MessageSquareQuote,
  "/admin/blog": PenTool,
};

interface SidebarContentProps {
  pathname: string;
  onNavigate?: () => void;
}

function SidebarContent({ pathname, onNavigate }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 font-semibold font-serif text-xl tracking-tight"
        >
          {siteConfig.name} <span className="text-muted-foreground text-sm font-sans font-normal ml-2">Admin</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
          {ADMIN_NAV_LINKS.map((link) => {
            const Icon = ICONS[link.href as keyof typeof ICONS] || LayoutDashboard;
            const isActive = link.href === "/admin"
              ? pathname === "/admin"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
            
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 min-h-[44px] md:min-h-[36px] transition-all hover:text-primary ${
                  isActive ? "bg-muted text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-4 border-t">
        <Link
          href="/"
          onClick={onNavigate}
          className={buttonVariants({ variant: "outline", className: "w-full justify-start min-h-[44px]" })}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View Live Site
        </Link>
      </div>
    </div>
  );
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-muted/40">
      <div className="hidden border-r bg-background md:block">
        <SidebarContent pathname={pathname} />
      </div>

      <div className="flex flex-col min-w-0">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger render={
              <button
                type="button"
                aria-label="Open admin navigation menu"
                className="inline-flex size-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden cursor-pointer -ml-2"
              >
                <Menu className="size-5" />
                <span className="sr-only">Open admin navigation menu</span>
              </button>
            } />
            <SheetContent side="left" className="flex flex-col p-0 w-72">
              <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
              <SidebarContent pathname={pathname} onNavigate={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1 min-w-0">
            <h1 className="font-semibold text-base sm:text-lg truncate text-foreground">
              {ADMIN_NAV_LINKS.find((l) =>
                l.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === linkMatch(l.href, pathname)
              )?.label || "Admin"}
            </h1>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:gap-6 lg:p-8 min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

function linkMatch(href: string, pathname: string): string {
  if (href === "/admin") return pathname === "/admin" ? "/admin" : "";
  return pathname === href || pathname.startsWith(`${href}/`) ? href : "";
}

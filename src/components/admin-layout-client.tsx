"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { ADMIN_NAV_LINKS } from "@/config/navigation";
import { ExternalLink, LayoutDashboard, Palette, ShoppingBag, Paintbrush, PenTool, FolderTree, Menu, MessageSquareQuote } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { siteConfig } from "@/config/site";

const ICONS = {
  "/admin": LayoutDashboard,
  "/admin/artworks": Palette,
  "/admin/categories": FolderTree,
  "/admin/orders": ShoppingBag,
  "/admin/custom-orders": Paintbrush,
  "/admin/testimonials": MessageSquareQuote,
  "/admin/blog": PenTool,
};

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold font-serif text-xl tracking-tight">
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
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  isActive ? "bg-muted text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-4 border-t">
        <Link
          href="/"
          className={buttonVariants({ variant: "outline", className: "w-full justify-start" })}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View Live Site
        </Link>
      </div>
    </div>
  );

  if (!mounted) return null; // Avoid hydration mismatch for simple layout wrapper

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-muted/40">
      <div className="hidden border-r bg-background md:block">
        <SidebarContent />
      </div>

      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <Sheet>
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
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="font-semibold text-lg hidden sm:block">
              {ADMIN_NAV_LINKS.find((l) =>
                l.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === l.href || pathname.startsWith(`${l.href}/`)
              )?.label || "Admin"}
            </h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

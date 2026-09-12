import Link from "next/link";
import Image from "next/image";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";
import { NavSearch } from "./NavSearch";
import { CartIcon } from "./CartIcon";
import { WishlistIcon } from "./WishlistIcon";
import { UserNav } from "./UserNav";


export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Anjori Arts Home">
          <div className="relative size-10 overflow-hidden rounded-full shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
            <Image src="/logo.jpg" alt="Anjori Arts Logo" fill className="object-cover scale-150" sizes="40px" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-2xl">
              Anjori Arts
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
              Indian art, made by hand
            </span>
          </div>
        </Link>

        <DesktopNav />

        <div className="flex items-center gap-1.5 sm:gap-3">
          <NavSearch />
          <WishlistIcon />
          <CartIcon />
          <div className="hidden sm:block">
            <UserNav />
          </div>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

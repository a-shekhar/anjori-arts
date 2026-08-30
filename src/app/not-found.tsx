import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 text-center bg-background">
      <span className="aa-eyebrow inline-block mb-3">404 Error</span>
      <h1 className="font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl lg:text-7xl text-foreground leading-[1.1]">
        Page not found
      </h1>
      <p className="mx-auto mt-6 max-w-lg text-base text-muted-foreground sm:text-lg leading-relaxed mb-10">
        We couldn&apos;t find the page you were looking for. The artwork might have been moved, or the link might be broken.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/">Return Home</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href="/shop">Browse Artworks</Link>
        </Button>
      </div>
    </div>
  );
}


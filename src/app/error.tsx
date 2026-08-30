"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 text-center bg-background">
      <span className="aa-eyebrow inline-block mb-3 text-destructive">Something went wrong</span>
      <h1 className="font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl lg:text-7xl text-foreground leading-[1.1]">
        We encountered an error
      </h1>
      <p className="mx-auto mt-6 max-w-lg text-base text-muted-foreground sm:text-lg leading-relaxed mb-10">
        Our team has been notified. Please try again or return to the homepage to continue exploring our art.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <Button onClick={() => reset()} size="lg" className="w-full sm:w-auto">
          Try Again
        </Button>
        <Link 
          href="/" 
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}


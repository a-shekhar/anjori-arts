import Image from "next/image";

interface GlobalPageLoaderProps {
  message?: string;
  subMessage?: string;
  className?: string;
}

export function GlobalPageLoader({
  message = "Loading...",
  subMessage = "Indian art, made by hand",
  className = "",
}: GlobalPageLoaderProps) {
  return (
    <div
      role="status"
      aria-label="Loading page content"
      aria-live="polite"
      className={`flex min-h-[65vh] w-full flex-col items-center justify-center px-4 py-16 ${className}`}
    >
      <div className="relative flex flex-col items-center">
        {/* Decorative Rotating Ring & Logo */}
        <div className="relative flex size-24 items-center justify-center">
          {/* Animated decorative outer spinner ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary/20 border-t-primary [animation-duration:1.6s]" />
          
          {/* Subtle outer breathing ring */}
          <div className="absolute -inset-2 animate-pulse rounded-full border border-primary/10" />

          {/* Logo container */}
          <div className="relative size-16 overflow-hidden rounded-full border border-border shadow-md">
            <Image
              src="/logo.jpg"
              alt="Anjori Arts Logo"
              fill
              priority
              className="object-cover scale-150"
              sizes="64px"
            />
          </div>
        </div>

        {/* Brand Text */}
        <div className="mt-6 flex flex-col items-center text-center">
          <span className="font-serif text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
            Anjori Arts
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {subMessage}
          </span>
        </div>

        {/* Animated Loading Dots & Message */}
        <div className="mt-5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span>{message}</span>
          <div className="flex items-center gap-1">
            <span className="size-1 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
            <span className="size-1 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
            <span className="size-1 animate-bounce rounded-full bg-primary" />
          </div>
        </div>

        <span className="sr-only">Loading page content...</span>
      </div>
    </div>
  );
}


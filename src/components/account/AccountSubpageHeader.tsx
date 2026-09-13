import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface AccountSubpageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}

export function AccountSubpageHeader({
  title,
  description,
  badge,
  action,
}: AccountSubpageHeaderProps) {
  return (
    <div className="border-b border-border pb-4 sm:pb-5 mb-5 sm:mb-6">
      {/* Mobile Back Button (< lg) */}
      <div className="lg:hidden mb-2.5">
        <Link
          href="/account"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1 group active:scale-95"
          aria-label="Return to account overview"
        >
          <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Account</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-foreground">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}


import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  crumbs: BreadcrumbItem[];
  className?: string;
}

/**
 * Server Component for rendering accessible breadcrumbs navigation
 * with automated BreadcrumbList JSON-LD structured data injection.
 */
export function Breadcrumbs({ crumbs, className }: BreadcrumbsProps) {
  if (!crumbs || crumbs.length === 0) {
    return null;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => {
      const item: {
        "@type": string;
        position: number;
        name: string;
        item?: string;
      } = {
        "@type": "ListItem",
        position: index + 1,
        name: crumb.label,
      };

      if (crumb.href) {
        item.item = crumb.href.startsWith("http")
          ? crumb.href
          : `${siteConfig.url}${crumb.href.startsWith("/") ? "" : "/"}${crumb.href}`;
      }

      return item;
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className={cn("w-full overflow-x-auto py-2", className)}>
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;

            return (
              <li
                key={`${crumb.label}-${index}`}
                className="inline-flex items-center gap-1.5 shrink-0"
              >
                {index > 0 && (
                  <ChevronRight
                    className="size-3 text-muted-foreground/60 shrink-0"
                    aria-hidden="true"
                  />
                )}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-foreground line-clamp-1 max-w-[200px] sm:max-w-none"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "line-clamp-1 max-w-[220px] sm:max-w-none",
                      isLast ? "font-medium text-foreground" : ""
                    )}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}


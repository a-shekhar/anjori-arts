import * as React from "react";
import { cn } from "@/lib/utils";

export interface CountryCodeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const COUNTRY_CODES = [
  { code: "+91", label: "IN (+91)" },
  // Easy to add more here later:
  // { code: "+1", label: "US/CA (+1)" },
  // { code: "+44", label: "UK (+44)" },
  // { code: "+61", label: "AU (+61)" },
  // { code: "+971", label: "UAE (+971)" },
];

export const CountryCodeSelect = React.forwardRef<HTMLSelectElement, CountryCodeSelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "h-8 w-full min-w-0 appearance-none rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80",
            className
          )}
          {...props}
        >
          {COUNTRY_CODES.map((country) => (
            <option className="bg-background text-foreground" key={country.code} value={country.code}>
              {country.code}
            </option>
          ))}
        </select>
        {/* Simple chevron icon for the native select */}
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 opacity-50"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    );
  }
);

CountryCodeSelect.displayName = "CountryCodeSelect";


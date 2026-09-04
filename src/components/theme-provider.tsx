"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// In React 19 + Next.js 16, next-themes injects an inline script during SSR to prevent
// theme flash (FOUC). React 19 flags inline <script> tags during client rendering,
// which Next.js surfaces as a dev overlay error. Suppress this false-positive in dev.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const origError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }
    origError.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}


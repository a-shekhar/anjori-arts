"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          margin: 0,
          padding: "2rem",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fcfbf7",
          color: "#1c1917",
        }}
      >
        <div style={{ maxWidth: "480px", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "2rem",
              marginBottom: "1rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              color: "#78716c",
              marginBottom: "1.5rem",
              lineHeight: 1.5,
              fontSize: "0.95rem",
            }}
          >
            An unexpected application error occurred. An alert has been sent to our
            team.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              backgroundColor: "#7c2d12",
              color: "#ffffff",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              fontSize: "0.95rem",
              fontWeight: 500,
              cursor: "pointer",
              minHeight: "44px",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}


import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust tracesSampleRate based on environment: 10% in production, 100% in development
  tracesSampleRate:
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE !== undefined
      ? parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE)
      : process.env.NODE_ENV === "production"
        ? 0.1
        : 1.0,

  // Setting this option to true will print useful information to the console while setting up Sentry.
  debug: false,
});


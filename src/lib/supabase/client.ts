import { createBrowserClient } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";

function buildClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!;

  return createBrowserClient(supabaseUrl, supabaseKey, {
    db: { schema: "arts" },
  });
}

type ClientType = ReturnType<typeof buildClient>;

let browserClient: ClientType | null = null;
let cachedSession: Session | null = null;
let isAuthListenerInitialized = false;

function initAuthCache(client: ClientType) {
  if (isAuthListenerInitialized || typeof window === "undefined") return;
  isAuthListenerInitialized = true;

  // Initialize from local cookies/storage (0 network requests)
  client.auth.getSession().then(({ data: { session } }) => {
    cachedSession = session;
  });

  // Keep updated on SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
  client.auth.onAuthStateChange((_event, session) => {
    cachedSession = session;
  });
}

export function createClient(): ClientType {
  if (typeof window === "undefined") {
    return buildClient();
  }

  if (!browserClient) {
    browserClient = buildClient();
    initAuthCache(browserClient);
  }

  return browserClient;
}

/**
 * Synchronously checks if the current browser visitor has an active authenticated session.
 * 0ms latency, 0 network requests to Supabase Auth.
 */
export function getIsAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  createClient();
  return Boolean(cachedSession?.user);
}

/**
 * Returns the cached session or resolves locally via getSession() with 0 network calls.
 */
export async function getAuthSession(): Promise<Session | null> {
  if (typeof window === "undefined") return null;
  const client = createClient();
  if (cachedSession) return cachedSession;
  const {
    data: { session },
  } = await client.auth.getSession();
  cachedSession = session;
  return session;
}

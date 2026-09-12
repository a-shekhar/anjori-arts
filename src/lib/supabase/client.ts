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

/**
 * Completely purges client-side cookies, local/session storage, and Supabase auth session.
 * Revokes session on Supabase server with global scope.
 */
export async function signOutClient(): Promise<void> {
  if (typeof window === "undefined") return;

  // 1. First revoke session on Supabase Auth server with global scope while tokens exist
  try {
    const client = createClient();
    await client.auth.signOut({ scope: "global" });
  } catch (err) {
    console.warn("[signOutClient] Supabase signOut notice:", err);
  }

  // 2. Reset module in-memory cache and client instance
  cachedSession = null;
  browserClient = null;
  isAuthListenerInitialized = false;

  // 3. Wipe all Supabase auth cookies from document.cookie
  try {
    const isLocal =
      !window.location.hostname ||
      window.location.hostname === "localhost" ||
      window.location.hostname.includes("127.0.0.1");

    const cookiesList = document.cookie.split(";");
    for (const cookie of cookiesList) {
      const name = cookie.split("=")[0]?.trim();
      if (!name) continue;
      if (
        name.startsWith("sb-") ||
        name.includes("supabase") ||
        name.includes("auth-token")
      ) {
        document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;`;
        if (!isLocal) {
          document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${window.location.hostname}; SameSite=Lax;`;
        }
      }
    }
  } catch {
    // ignore
  }

  // 4. Wipe Supabase localStorage items
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("sb-") ||
          key.includes("supabase") ||
          key.includes("auth-token"))
      ) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore
  }

  // 5. Wipe Supabase sessionStorage items
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (
        key &&
        (key.startsWith("sb-") ||
          key.includes("supabase") ||
          key.includes("auth-token"))
      ) {
        sessionStorage.removeItem(key);
      }
    }
  } catch {
    // ignore
  }
}

const AUTH_CHANNEL_NAME = "anjori_auth_channel";

/**
 * Broadcasts auth lifecycle events across all open browser tabs and windows.
 */
export function broadcastAuthEvent(event: "SIGNED_OUT" | "SIGNED_IN"): void {
  if (typeof window === "undefined") return;

  try {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
      channel.postMessage({ event, timestamp: Date.now() });
      channel.close();
    }
  } catch {
    // ignore
  }

  // Fallback for environments where BroadcastChannel is blocked
  try {
    localStorage.setItem(
      "anjori_auth_broadcast",
      JSON.stringify({ event, timestamp: Date.now() })
    );
  } catch {
    // ignore
  }
}

/**
 * Subscribes to cross-tab auth sync events.
 */
export function subscribeToAuthSync(onSignOut: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  let channel: BroadcastChannel | null = null;

  try {
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
      channel.onmessage = (e) => {
        if (e.data?.event === "SIGNED_OUT") {
          onSignOut();
        }
      };
    }
  } catch {
    channel = null;
  }

  const storageHandler = (e: StorageEvent) => {
    if (e.key === "anjori_auth_broadcast" && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed?.event === "SIGNED_OUT") {
          onSignOut();
        }
      } catch {
        // ignore
      }
    }
  };

  window.addEventListener("storage", storageHandler);

  return () => {
    if (channel) {
      try {
        channel.close();
      } catch {
        // ignore
      }
    }
    window.removeEventListener("storage", storageHandler);
  };
}

export interface PerformSignOutOptions {
  redirectTo?: string;
}

/**
 * Authoritative, comprehensive single sign-out function for the entire application:
 * 1. Clears client UI stores (Cart and Wishlist).
 * 2. Purges client cookies, local/session storage, and Supabase auth session.
 * 3. Broadcasts SIGNED_OUT to all open browser tabs.
 * 4. Navigates cleanly to /auth/signout to wipe server cookies via HTTP 302 redirect.
 */
export async function performSignOut(
  options: PerformSignOutOptions = {}
): Promise<void> {
  const destination = options.redirectTo || "/login";

  if (typeof window === "undefined") return;

  // 1. Immediately clear Cart and Wishlist stores optimistically
  try {
    const [{ useCartStore }, { useWishlistStore }] = await Promise.all([
      import("@/stores/cart-store"),
      import("@/stores/wishlist-store"),
    ]);
    useCartStore.getState().clearCart({ skipCloudSync: true });
    useWishlistStore.getState().clearWishlist();
  } catch (err) {
    console.warn("[performSignOut] Store clear notice:", err);
  }

  // 2. Perform client-side token revocation and storage purge
  try {
    await signOutClient();
  } catch (err) {
    console.warn("[performSignOut] signOutClient notice:", err);
  }

  // 3. Broadcast to all open tabs
  broadcastAuthEvent("SIGNED_OUT");

  // 4. Also call server logout action in background if needed
  try {
    const { logout } = await import("@/actions/auth");
    await logout();
  } catch {
    // ignore
  }

  // 5. Navigate to /auth/signout route handler for complete HTTP 302 Set-Cookie wipe
  const signoutUrl = `/auth/signout?next=${encodeURIComponent(destination)}`;
  window.location.replace(signoutUrl);
}

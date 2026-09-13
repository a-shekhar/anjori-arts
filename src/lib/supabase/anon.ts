import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let anonClient: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Returns a centralized anonymous Supabase client scoped to the "arts" schema.
 * Caches the client instance to eliminate duplicate connection instantiation overhead.
 */
export function getAnonClient() {
  if (!anonClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!;
    anonClient = createSupabaseClient(url, key, {
      db: { schema: "arts" } as any,
    });
  }
  return anonClient;
}

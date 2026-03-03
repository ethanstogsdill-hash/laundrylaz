import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Creates a Supabase admin client that bypasses Row Level Security.
 *
 * This client uses the service role key and should ONLY be used in trusted
 * server-side contexts (Server Actions, Route Handlers, API routes, cron jobs).
 * Never expose this client or the service role key to the browser.
 *
 * Usage:
 *   import { createAdminClient } from "@/lib/supabase/admin";
 *   const supabase = createAdminClient();
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

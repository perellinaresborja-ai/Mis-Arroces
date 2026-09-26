import { createClient as createAdminClient } from "@supabase/supabase-js"
import { Database } from "@/types/database.types"

const DEFAULT_SUPABASE_URL = "https://zvesoygqssyyojqyswwm.supabase.co"

/**
 * Creates a server-side Supabase client for administrative operations.
 * Requires SUPABASE_SERVICE_ROLE_KEY configured in the server environment.
 * Throws a clear, controlled Error if the service role key is missing,
 * ensuring no silent degradation to unprivileged client access.
 */
export function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!adminKey) {
    throw new Error(
      "[Admin Client] SUPABASE_SERVICE_ROLE_KEY is not configured in the server environment. Administrative operations require a valid service role key."
    )
  }

  return createAdminClient<Database>(supabaseUrl, adminKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

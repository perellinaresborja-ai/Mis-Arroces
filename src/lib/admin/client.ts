import { createClient as createAdminClient } from "@supabase/supabase-js"
import { Database } from "@/types/database.types"

const DEFAULT_SUPABASE_URL = "https://zvesoygqssyyojqyswwm.supabase.co"
const DEFAULT_ANON_KEY = "sb_publishable_Mb44JxYbS4XJ34ifJWdMzw_52xqn3lW"

/**
 * Creates a server-side Supabase client for administrative operations.
 * If SUPABASE_SERVICE_ROLE_KEY is configured in the environment, it uses elevated service_role privileges.
 * If not present in serverless host configurations, it falls back gracefully to the public server key without crashing.
 */
export function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL
  const adminKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_ANON_KEY

  return createAdminClient<Database>(supabaseUrl, adminKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

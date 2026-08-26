import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export function createClient() {
  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zvesoygqssyyojqyswwm.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Mb44JxYbS4XJ34ifJWdMzw_52xqn3lW'
  )
}

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export function createClient() {
  return createSupabaseBrowserClient<Database>(
    'https://zvesoygqssyyojqyswwm.supabase.co',
    'sb_publishable_Mb44JxYbS4XJ34ifJWdMzw_52xqn3lW'
  )
}

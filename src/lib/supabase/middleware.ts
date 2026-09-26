import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    'https://zvesoygqssyyojqyswwm.supabase.co',
    'sb_publishable_Mb44JxYbS4XJ34ifJWdMzw_52xqn3lW',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    // Refresh session if expired (network errors during cold start must not crash the whole page)
    await supabase.auth.getUser()
  } catch (error) {
    console.warn('[Middleware] Supabase auth refresh non-fatal error:', error)
  }

  return supabaseResponse
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // The next query param is for redirecting after successful sign in
  const next = searchParams.get('next') ?? '/cookbook'

  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session) {
      // Auto-create missing profile just in case
      const { data: profile } = await supabase.from("profiles").select("username").eq("id", session.user.id).single()
      if (!profile) {
        await supabase.from("profiles").insert({
          id: session.user.id,
          username: `arrocero${Math.floor(Math.random() * 1000000)}`,
          display_name: 'Chef Arrocero',
          account_type: 'USER',
          privacy_level: 'PUBLIC'
        })
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=El enlace ha caducado o ya ha sido utilizado. Por favor, intenta iniciar sesión.`)
}

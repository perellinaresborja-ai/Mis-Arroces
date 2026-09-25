import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // The next query param is for redirecting after successful sign in
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const returnCookie = cookieStore.get('misarroces_return_to')?.value
  if (returnCookie) {
    cookieStore.delete('misarroces_return_to')
  }
  const next = searchParams.get('next') || returnCookie || '/create/recipe'

  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session) {
      const { data: profile } = await supabase.from("profiles").select("username").eq("id", session.user.id).maybeSingle()
      if (!profile) {
        const metaUser = (session.user.user_metadata?.username || "").trim().toLowerCase().replace(/[^a-z0-9_.]/g, '')
        const metaName = (session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || "").trim()

        if (metaUser && metaName) {
          await supabase.from("profiles").upsert({
            id: session.user.id,
            username: metaUser,
            display_name: metaName,
            account_type: 'PERSONAL',
            privacy_level: 'PUBLIC',
            onboarding_completed: true
          }, { onConflict: 'id' })
        } else {
          const response = NextResponse.redirect(`${origin}/onboarding`)
          response.cookies.set("ma_has_account", "1", {
            path: "/",
            maxAge: 60 * 60 * 24 * 730,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
          })
          return response
        }

        // Registro interno de recomendación si existe cookie founder_ref
        try {
          const { cookies } = await import('next/headers');
          const cookieStore = await cookies();
          const refCode = cookieStore.get('founder_ref')?.value;
          if (refCode) {
            const { data: refIdentity } = await supabase
              .from('user_identities' as any)
              .select('user_id')
              .eq('public_code', refCode)
              .maybeSingle();

            const refUserId = (refIdentity as any)?.user_id;
            if (refUserId && refUserId !== session.user.id) {
              await (supabase.from('founder_referrals' as any) as any).insert({
                referrer_founder_id: refUserId,
                referred_user_id: session.user.id,
                referral_code: refCode,
                registered_at: new Date().toISOString(),
              });
            }
          }
        } catch {
          // No bloqueante
        }
      }
      const response = NextResponse.redirect(`${origin}${next}`)
      response.cookies.set("ma_has_account", "1", {
        path: "/",
        maxAge: 60 * 60 * 24 * 730,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      })
      return response
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=El enlace ha caducado o ya ha sido utilizado. Por favor, intenta iniciar sesión.`)
}

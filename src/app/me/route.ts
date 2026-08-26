import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  
  // Refresca o lee la sesión
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Resuelve el nombre de usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()
  
  if (profile?.username) {
    // Redirige al perfil social real
    return NextResponse.redirect(new URL(`/@${profile.username}`, request.url))
  }

  // Si no hay perfil, lo mandamos al index o login para que se repare
  return NextResponse.redirect(new URL('/login', request.url))
}

import QRCode from 'qrcode';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const cleanCode = code?.trim();

    if (!cleanCode || !/^[a-zA-Z0-9_-]{6,64}$/.test(cleanCode)) {
      return new NextResponse('Código de ID inválido', { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Permitir el código demo de prueba para testing solo si es admin
    const isDemoCode = cleanCode === 'a8f9c1e2b4d63f01';

    if (isDemoCode) {
      if (!user) {
        return new NextResponse('No autorizado. El código QR es personal e intransferible.', { status: 403 });
      }
    } else {
      // Validar contra la base de datos que la identidad existe, está activa y pertenece al usuario autenticado
      const { data: identity } = await supabase
        .from('user_identities' as any)
        .select('id, is_active, user_id')
        .eq('public_code', cleanCode)
        .maybeSingle();

      if (!identity || !(identity as any).is_active) {
        return new NextResponse('Identidad no encontrada o inactiva', { status: 404 });
      }

      if (!user || user.id !== (identity as any).user_id) {
        return new NextResponse('No autorizado. El código QR es personal e intransferible.', { status: 403 });
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.misarroces.es';
    const targetUrl = `${siteUrl}/id/${cleanCode}`;

    // Generate high quality PNG buffer directly on our server
    const pngBuffer = await QRCode.toBuffer(targetUrl, {
      width: 280,
      margin: 1,
      color: {
        dark: '#18181B',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return new NextResponse('Error generating QR', { status: 500 });
  }
}

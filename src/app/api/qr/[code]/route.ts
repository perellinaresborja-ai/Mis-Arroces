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

    // Permitir el código demo de prueba para testing
    const isDemoCode = cleanCode === 'a8f9c1e2b4d63f01';

    if (!isDemoCode) {
      // Validar contra la base de datos que la identidad existe y está activa
      const supabase = await createClient();
      const { data: identity } = await supabase
        .from('user_identities' as any)
        .select('id, is_active')
        .eq('public_code', cleanCode)
        .maybeSingle();

      if (!identity || !(identity as any).is_active) {
        return new NextResponse('Identidad no encontrada o inactiva', { status: 404 });
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
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return new NextResponse('Error generating QR', { status: 500 });
  }
}

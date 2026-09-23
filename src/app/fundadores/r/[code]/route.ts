import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const cleanCode = code?.trim();

  const response = NextResponse.redirect(new URL('/fundadores', request.url));

  if (cleanCode && /^[a-zA-Z0-9_-]{6,64}$/.test(cleanCode)) {
    const cookieStore = await cookies();
    cookieStore.set('founder_ref', cleanCode, {
      maxAge: 60 * 60 * 24 * 30, // 30 días de persistencia
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
    });
  }

  return response;
}

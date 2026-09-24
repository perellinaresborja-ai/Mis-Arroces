import { NextResponse } from 'next/server';

const BOT_USER_AGENTS = /facebookexternalhit|Facebot|WhatsApp|Twitterbot|TelegramBot|Slackbot|LinkedInBot|Discordbot|Pinterest|SkypeUriPreview|Applebot|Googlebot|bingbot/i;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const cleanCode = code?.trim();
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = BOT_USER_AGENTS.test(userAgent);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.misarroces.es';

  // Si es un crawler/scraper (WhatsApp, Facebook, etc.) devolvemos 200 OK con metadatos Open Graph completos
  if (isBot) {
    const ogTitle = 'Los 100 Arroceros Fundadores | misarroces';
    const ogDesc = 'Una invitación para formar parte del inicio de misarroces.';
    const ogImage = `${baseUrl}/logover.png`;
    const ogUrl = cleanCode ? `${baseUrl}/fundadores/r/${cleanCode}` : `${baseUrl}/fundadores`;

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${ogTitle}</title>
  <meta name="description" content="${ogDesc}" />
  
  <!-- Open Graph / WhatsApp / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="misarroces" />
  <meta property="og:title" content="${ogTitle}" />
  <meta property="og:description" content="${ogDesc}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:secure_url" content="${ogImage}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Los 100 Arroceros Fundadores | misarroces" />
  <meta property="og:url" content="${ogUrl}" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${ogTitle}" />
  <meta name="twitter:description" content="${ogDesc}" />
  <meta name="twitter:image" content="${ogImage}" />

  <link rel="canonical" href="${baseUrl}/fundadores" />
</head>
<body>
</body>
</html>`;

    const res = new NextResponse(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
      },
    });

    if (cleanCode && /^[a-zA-Z0-9_-]{3,64}$/.test(cleanCode)) {
      res.cookies.set('founder_ref', cleanCode, {
        maxAge: 60 * 60 * 24 * 30, // 30 días de persistencia
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
      });
    }

    return res;
  }

  // Navegador de usuario normal: redirigir a /fundadores seteando la cookie de referido
  const response = NextResponse.redirect(new URL('/fundadores', request.url));

  if (cleanCode && /^[a-zA-Z0-9_-]{3,64}$/.test(cleanCode)) {
    response.cookies.set('founder_ref', cleanCode, {
      maxAge: 60 * 60 * 24 * 30, // 30 días de persistencia
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
    });
  }

  return response;
}

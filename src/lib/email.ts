import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function buildEmailHtml({
  title,
  body,
  ctaText,
  ctaUrl,
}: {
  title: string
  body: string
  ctaText?: string
  ctaUrl?: string
}): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F7F5F0;">
  <div style="background-color:#F7F5F0;padding:30px 15px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:500px;margin:0 auto;background:#FFFFFF;border-radius:24px;border:1px solid #EAE7E0;box-shadow:0 4px 20px rgba(0,0,0,0.06);padding:35px 25px;text-align:center;">

      <img
        src="https://www.misarroces.es/logofon.png"
        alt="misarroces"
        width="200"
        style="display:block;margin:0 auto 28px auto;max-width:100%;height:auto;"
      />

      <h2 style="color:#18181B;font-size:22px;font-weight:800;margin:0 0 14px 0;">
        ${title}
      </h2>

      <div style="color:#52525B;font-size:15px;line-height:26px;margin:0 0 28px 0;">
        ${body}
      </div>

      ${ctaText && ctaUrl ? `
      <a
        href="${ctaUrl}"
        target="_blank"
        style="display:inline-block;background-color:#EA580C;color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:14px;box-shadow:0 4px 14px rgba(234,88,12,0.3);"
      >
        ${ctaText}
      </a>
      ` : ''}

      <div style="border-top:1px solid #F4F4F5;margin-top:28px;padding-top:18px;">
        <p style="color:#52525B;font-size:12px;font-weight:700;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.05em;">
          Vamos al grano.
        </p>
        <p style="color:#A1A1AA;font-size:11px;margin:0;">
          © 2026 misarroces · <a href="https://www.misarroces.es" style="color:#EA580C;text-decoration:none;">misarroces.es</a>
        </p>
      </div>

    </div>
  </div>
</body>
</html>
`
}

export async function sendWelcomeEmail(to: string) {
  await resend.emails.send({
    from: 'misarroces <info@misarroces.es>',
    to,
    subject: '¡Bienvenido a misarroces!',
    html: buildEmailHtml({
      title: '¡Bienvenido a misarroces!',
      body: 'Ya eres parte de la comunidad. Empieza a guardar y compartir tus mejores recetas de arroz.',
      ctaText: 'Explorar misarroces',
      ctaUrl: 'https://www.misarroces.es',
    }),
  })
}

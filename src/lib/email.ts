import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

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
  <div style="background-color:#F7F5F0;padding:20px 10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:460px;margin:0 auto;background:#FFFFFF;border-radius:24px;border:1px solid #EAE7E0;box-shadow:0 4px 20px rgba(0,0,0,0.06);padding:28px 20px 22px 20px;text-align:center;">

      <!-- 1. Logo misarroces -->
      <img
        src="https://www.misarroces.es/logover.png"
        alt="misarroces"
        width="150"
        style="display:block;margin:0 auto 20px auto;max-width:100%;height:auto;"
      />

      <!-- 2. Título -->
      <h2 style="color:#18181B;font-size:20px;font-weight:800;margin:0 0 14px 0;letter-spacing:-0.02em;">
        ${title}
      </h2>

      <!-- Cuerpo estructurado -->
      <div style="color:#52525B;font-size:14px;line-height:23px;margin:0 0 20px 0;">
        ${body}
      </div>

      ${ctaText && ctaUrl ? `
      <div style="margin:20px 0 18px 0;">
        <a
          href="${ctaUrl}"
          target="_blank"
          style="display:inline-block;background-color:#EA580C;color:#FFFFFF;font-size:14px;font-weight:800;letter-spacing:0.04em;text-decoration:none;padding:12px 30px;border-radius:12px;box-shadow:0 4px 14px rgba(234,88,12,0.25);text-transform:uppercase;"
        >
          ${ctaText}
        </a>
      </div>
      ` : ''}

      <!-- 12. Separador fino -->
      <div style="border-top:1px solid #F4F4F5;margin-top:22px;padding-top:16px;">
        <!-- 13. Cierre -->
        <p style="color:#52525B;font-size:12px;font-weight:800;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.06em;">
          VAMOS AL GRANO.
        </p>
        <!-- 14. Footer -->
        <p style="color:#A1A1AA;font-size:11px;margin:0;">
          © 2026 <a href="https://www.misarroces.es" style="color:#EA580C;text-decoration:none;">misarroces.es</a>
        </p>
      </div>

    </div>
  </div>
</body>
</html>
`
}

export async function sendWelcomeEmail(to: string) {
  return await getResend().emails.send({
    from: 'misarroces <info@misarroces.es>',
    to,
    subject: '¡Bienvenido a misarroces!',
    html: buildEmailHtml({
      title: '¡Bienvenido a misarroces!',
      body: 'Ya eres parte de la comunidad. Empieza a guardar y compartir tus mejores recetas de arroz.',
      ctaText: 'EXPLORAR MISARROCES',
      ctaUrl: 'https://www.misarroces.es',
    }),
  })
}

export async function sendFounderEmail(
  to: string,
  founderNumber: number,
  userDetails?: { displayName?: string; username?: string; publicCode?: string }
) {
  const formattedNumber = String(founderNumber).padStart(3, '0')
  const cleanUsername = userDetails?.username ? userDetails.username.replace(/^@/, '') : 'arrocero'
  const displayName = userDetails?.displayName || `@${cleanUsername}`
  const publicCode = userDetails?.publicCode || cleanUsername
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.misarroces.es'
  const idUrl = `${baseUrl}/id/${publicCode}`
  const referralUrl = `${baseUrl}/fundadores/r/${publicCode}`

  const qrImageSrc = `${baseUrl}/api/qr/${publicCode}`

  return await getResend().emails.send({
    from: 'misarroces <info@misarroces.es>',
    to,
    subject: `¡Bienvenido, Arrocero Fundador #${formattedNumber}!`,
    html: buildEmailHtml({
      title: `Bienvenido, Arrocero Fundador #${formattedNumber}`,
      body: `
        <!-- 3. Texto -->
        <p style="margin:0 0 14px 0;font-size:14px;color:#3F3F46;line-height:23px;text-align:center;">
          Formas parte de Los 100 Arroceros Fundadores de misarroces.<br />
          Tu número <strong>#${formattedNumber}</strong> es único y será tuyo para siempre.
        </p>

        <!-- 4. Destacado -->
        <div style="background:#F7F5F0;border-left:3px solid #EA580C;padding:8px 12px;margin:14px 0 12px 0;text-align:left;border-radius:0 8px 8px 0;">
          <p style="margin:0;font-size:14px;font-weight:800;color:#18181B;">
            Estuviste aquí desde el principio.
          </p>
        </div>

        <!-- 5. Texto -->
        <p style="margin:0 0 14px 0;font-size:14px;color:#52525B;line-height:23px;text-align:left;">
          misarroces&zwnj;.es nace para reunir a quienes compartimos una misma pasión: el arroz. Un lugar donde guardar y compartir recetas, descubrir otros arroceros, aprender y seguir haciendo crecer la cultura del arroz.
        </p>

        <!-- Destacado ID -->
        <div style="background:#F7F5F0;border-left:3px solid #EA580C;padding:8px 12px;margin:12px 0 10px 0;text-align:left;border-radius:0 8px 8px 0;">
          <p style="margin:0;font-size:14px;font-weight:800;color:#18181B;">
            Aquí tienes tu ID de Arrocero Fundador.
          </p>
        </div>

        <!-- Texto QR -->
        <p style="margin:0 0 16px 0;font-size:14px;color:#52525B;line-height:23px;text-align:left;">
          Tu QR está vinculado a tu cuenta de misarroces&zwnj;.es y te identifica como uno de Los 100 Arroceros Fundadores. Además será tu identificación para participar en jornadas, catas, concursos y otras experiencias de la comunidad arrocera.
        </p>

        <!-- ID FUNDADOR VERTICAL (DISEÑO ELEVADO, MINIMAL Y ELEGANTE) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="width:244px;max-width:244px;margin:16px auto 14px auto;background-color:#FAF8F5;border:1.5px solid #EA580C;border-radius:22px;box-shadow:0 6px 22px rgba(234,88,12,0.08);overflow:hidden;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <tr>
            <td style="padding:7px;">
              
              <!-- Marco interior fino (efecto membrete de edición limitada) -->
              <div style="border:1px solid #EAE3D7;border-radius:16px;padding:14px 10px 10px 10px;background-color:#FDFBF7;">
                
                <!-- Encabezado con marca y píldora -->
                <div style="font-size:15px;font-weight:900;color:#18181B;letter-spacing:-0.02em;line-height:1;margin-bottom:3px;">
                  <img src="https://www.misarroces.es/logopaellaicono.png" width="18" height="18" alt="Icono paella" style="vertical-align:middle;margin-right:5px;display:inline-block;" />
                  <span style="vertical-align:middle;">mis<span style="color:#EA580C;">arroces</span></span>
                </div>
                <div style="display:inline-block;background:#FFFFFF;border:1px solid #EA580C;border-radius:100px;padding:1px 8px;font-size:8px;font-weight:800;color:#EA580C;letter-spacing:0.18em;margin-top:2px;margin-bottom:8px;text-transform:uppercase;">
                  ARROCERO FUNDADOR
                </div>

                <!-- Número protagonista en negro -->
                <div style="font-size:38px;font-weight:900;color:#18181B;line-height:1;margin:0 0 3px 0;letter-spacing:-0.03em;white-space:nowrap;">
                  <span style="color:#18181B;font-size:30px;font-weight:800;margin-right:1px;">#</span>${formattedNumber}
                </div>

                <!-- Usuario único con @ en negro -->
                <div style="font-size:14px;font-weight:800;color:#18181B;line-height:1.2;margin:2px 0 10px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;">
                  @${cleanUsername}
                </div>

                <!-- QR Centrado con marco fino de precisión -->
                <div style="background:#FFFFFF;border:1px solid #E5DFD5;border-radius:12px;padding:6px;display:inline-block;box-shadow:0 3px 10px rgba(0,0,0,0.04);margin-bottom:9px;">
                  <img
                    src="${qrImageSrc}"
                    alt="QR #${formattedNumber}"
                    width="96"
                    height="96"
                    style="display:block;border-radius:5px;"
                  />
                </div>

                <!-- Pie de ID con micro-sello elegante en negro -->
                <div style="border-top:1px dashed #E0D8CB;padding-top:7px;margin-top:1px;">
                  <div style="font-size:9px;font-weight:800;color:#18181B;letter-spacing:0.22em;line-height:1;margin-bottom:2px;text-transform:uppercase;">
                    ✦ LOS 100 ✦
                  </div>
                  <div style="font-size:9px;font-weight:700;color:#A1A1AA;letter-spacing:0.06em;line-height:1;">
                    misarroces
                  </div>
                </div>

              </div>

            </td>
          </tr>
        </table>

        <!-- BOTÓN NARANJA “VER MI ID” (JUSTO DEBAJO DEL ID) -->
        <div style="margin:14px 0 18px 0;text-align:center;">
          <a
            href="${idUrl}"
            target="_blank"
            style="display:inline-block;background-color:#EA580C;color:#FFFFFF;font-size:14px;font-weight:800;letter-spacing:0.04em;text-decoration:none;padding:12px 30px;border-radius:12px;box-shadow:0 4px 14px rgba(234,88,12,0.25);text-transform:uppercase;"
          >
            VER MI ID
          </a>
        </div>

        <!-- RECOMENDAR A UN ARROCERO -->
        <div style="margin:26px 0 14px 0;padding-top:18px;border-top:1px solid #EAE7E0;text-align:left;">
          <p style="margin:0 0 8px 0;font-size:14px;font-weight:800;color:#18181B;">
            ¿Conoces a otro arrocero que debería estar entre Los 100?
          </p>
          <p style="margin:0 0 16px 0;font-size:13.5px;color:#52525B;line-height:22px;">
            Invítalo ahora. Las plazas son limitadas y, cuando Los 100 estén completos, se cerrará para siempre.
          </p>
          <div style="text-align:center;margin:12px 0 6px 0;">
            <a
              href="${referralUrl}"
              target="_blank"
              style="display:inline-block;background-color:#18181B;color:#FFFFFF;font-size:13px;font-weight:800;letter-spacing:0.04em;text-decoration:none;padding:12px 28px;border-radius:12px;box-shadow:0 3px 12px rgba(0,0,0,0.12);text-transform:uppercase;"
            >
              RECOMENDAR A UN ARROCERO
            </a>
          </div>
        </div>
      `,
    }),
  })
}

export async function sendAdminEmail(to: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.misarroces.es'
  const publicCode = '18d5f0f25ca26440'
  const idUrl = `${baseUrl}/id/${publicCode}`
  const qrImageSrc = `${baseUrl}/api/qr/${publicCode}`

  return await getResend().emails.send({
    from: 'misarroces <info@misarroces.es>',
    to,
    subject: '¡Tu ID de Administrador en misarroces! ✦ @perellinares',
    html: buildEmailHtml({
      title: 'Tu ID Oficial de Administrador',
      body: `
        <p style="margin:0 0 14px 0;font-size:14px;color:#3F3F46;line-height:23px;text-align:center;">
          Aquí tienes tu ID oficial permanente como creador y administrador de misarroces.
        </p>

        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:14px auto 10px auto;width:240px;background:#FAF8F5;border:1.5px solid #18181B;border-radius:20px;padding:6px;box-shadow:0 6px 18px rgba(0,0,0,0.08);">
          <tr>
            <td align="center" style="border:1px solid #EAE3D7;border-radius:15px;background:#FDFBF7;padding:14px 10px 10px 10px;text-align:center;">
              <div style="margin-bottom:8px;">
                <span style="font-size:15px;font-weight:900;color:#18181B;letter-spacing:-0.03em;">mis<span style="color:#EA580C;">arroces</span></span>
              </div>
              <div style="display:inline-block;background:#FFFFFF;border:1px solid #18181B;border-radius:20px;padding:2px 10px;font-size:8px;font-weight:900;color:#18181B;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:10px;">
                ID ADMIN
              </div>
              <div style="font-size:14px;font-weight:900;color:#18181B;margin-bottom:10px;">
                @perellinares
              </div>
              <div style="background:#FFFFFF;border:1px solid #E5DFD5;border-radius:12px;padding:6px;display:inline-block;box-shadow:0 3px 10px rgba(0,0,0,0.04);margin-bottom:9px;">
                <img src="${qrImageSrc}" alt="QR @perellinares" width="96" height="96" style="display:block;border-radius:5px;" />
              </div>
              <div style="border-top:1px dashed #E0D8CB;padding-top:7px;margin-top:1px;">
                <div style="font-size:9px;font-weight:800;color:#18181B;letter-spacing:0.22em;line-height:1;margin-bottom:2px;text-transform:uppercase;">
                  ✦ ADMIN ✦
                </div>
                <div style="font-size:9px;font-weight:700;color:#A1A1AA;letter-spacing:0.06em;line-height:1;">
                  misarroces
                </div>
              </div>
            </td>
          </tr>
        </table>

        <div style="margin:14px 0 18px 0;text-align:center;">
          <a
            href="${idUrl}"
            target="_blank"
            style="display:inline-block;background-color:#EA580C;color:#FFFFFF;font-size:14px;font-weight:800;letter-spacing:0.04em;text-decoration:none;padding:12px 30px;border-radius:12px;box-shadow:0 4px 14px rgba(234,88,12,0.25);text-transform:uppercase;"
          >
            VER MI ID
          </a>
        </div>
      `,
    }),
  })
}

export async function sendFounderInvitationEmail({
  to,
  inviterName,
  referralUrl,
}: {
  to: string
  inviterName: string
  referralUrl: string
}) {
  const resend = getResend()
  const subject = 'Una invitación para formar parte de Los 100'

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F5F0;">
  <div style="background-color:#F7F5F0;padding:28px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:460px;margin:0 auto;background:#FFFFFF;border-radius:24px;border:1px solid #EAE7E0;box-shadow:0 4px 20px rgba(0,0,0,0.06);padding:32px 24px 28px 24px;text-align:center;">

      <!-- 1. Logo oficial misarroces arriba -->
      <a href="https://www.misarroces.es" target="_blank" style="text-decoration:none;display:inline-block;">
        <img
          src="https://www.misarroces.es/logover.png"
          alt="misarroces"
          width="150"
          style="display:block;margin:0 auto 24px auto;max-width:100%;height:auto;border:0;"
        />
      </a>

      <!-- Píldora distintiva -->
      <div style="display:inline-block;background:#FAF8F5;border:1px solid #EA580C;border-radius:100px;padding:3px 12px;font-size:9px;font-weight:800;color:#EA580C;letter-spacing:0.18em;margin-bottom:18px;text-transform:uppercase;">
        LOS 100 ARROCEROS FUNDADORES
      </div>

      <!-- 2. Título -->
      <h2 style="color:#18181B;font-size:20px;font-weight:900;margin:0 0 18px 0;letter-spacing:-0.02em;line-height:1.3;">
        Una invitación para formar parte de Los 100
      </h2>

      <!-- 3. Contenido -->
      <div style="color:#3F3F46;font-size:14.5px;line-height:24px;text-align:left;margin:0 0 24px 0;">
        <p style="margin:0 0 14px 0;">
          Hola,
        </p>
        <p style="margin:0 0 14px 0;">
          <strong>${inviterName}</strong> quiere invitarte a conocer Los 100 Arroceros Fundadores de misarroces.
        </p>
        <p style="margin:0 0 14px 0;color:#52525B;">
          Los 100 reúnen a los primeros arroceros que forman parte del proyecto y publican su primera receta mientras el acceso permanece abierto.
        </p>
        <p style="margin:0;color:#52525B;">
          Una vez completadas las plazas, el acceso se cerrará de forma automática y definitiva.
        </p>
      </div>

      <!-- 4. Botón naranja principal -->
      <div style="margin:26px 0 14px 0;">
        <a
          href="${referralUrl}"
          target="_blank"
          style="display:inline-block;background-color:#EA580C;color:#FFFFFF;font-size:14px;font-weight:900;letter-spacing:0.04em;text-decoration:none;padding:14px 34px;border-radius:14px;box-shadow:0 4px 14px rgba(234,88,12,0.28);text-transform:uppercase;"
        >
          CONOCER LOS 100
        </a>
      </div>

      <!-- 5. Nota discreta debajo del botón -->
      <p style="color:#A1A1AA;font-size:11.5px;line-height:17px;margin:12px 0 24px 0;max-width:380px;display:inline-block;">
        Esta invitación no reserva ni garantiza una plaza. El acceso se obtiene al cumplir las condiciones mientras permanezca abierto.
      </p>

      <!-- 6. Separador y Firma / pie -->
      <div style="border-top:1px solid #F4F4F5;margin-top:16px;padding-top:18px;text-align:center;">
        <p style="color:#18181B;font-size:13px;font-weight:900;margin:0 0 2px 0;letter-spacing:-0.01em;">
          misarroces
        </p>
        <p style="color:#71717A;font-size:11.5px;margin:0;font-weight:500;">
          La red social de los arroces
        </p>
      </div>

    </div>
  </div>
</body>
</html>
`

  return await resend.emails.send({
    from: 'misarroces <info@misarroces.es>',
    to,
    subject,
    html,
  })
}
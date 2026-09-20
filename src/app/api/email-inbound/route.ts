import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Addresses that must NEVER receive an autoresponse (anti-loop)
const BLOCKED_SENDERS = [
  'noreply', 'no-reply', 'mailer-daemon', 'postmaster',
  'bounce', 'auto-reply', 'info@misarroces.es',
]

function shouldIgnore(from: string): boolean {
  const lower = from.toLowerCase()
  return BLOCKED_SENDERS.some((b) => lower.includes(b))
}

function buildEmailHtml(senderName: string): string {
  const name = senderName || 'gracias por escribirnos'
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
        ¡Hemos recibido tu mensaje!
      </h2>

      <p style="color:#52525B;font-size:15px;line-height:26px;margin:0 0 28px 0;">
        Muchas gracias por escribirnos. Nuestro equipo revisará tu consulta y te responderá a la mayor brevedad posible.
      </p>

      <a
        href="https://www.misarroces.es"
        target="_blank"
        style="display:inline-block;background-color:#EA580C;color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:14px;box-shadow:0 4px 14px rgba(234,88,12,0.3);"
      >
        Descubrir misarroces
      </a>

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

function extractEmail(from: string): string {
  // Handle "Name <email@domain.com>" format
  const match = from.match(/<([^>]+)>/)
  return match ? match[1] : from.trim()
}

function extractName(from: string): string {
  // Handle "Name <email@domain.com>" format
  const match = from.match(/^([^<]+)</)
  return match ? match[1].trim() : ''
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Resend inbound webhook payload
    const from: string = body?.data?.from ?? body?.from ?? ''
    const subject: string = body?.data?.subject ?? body?.subject ?? ''

    if (!from) {
      return NextResponse.json({ error: 'No sender' }, { status: 400 })
    }

    // Anti-loop: ignore automated senders
    if (shouldIgnore(from)) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    // Also skip if Auto-Submitted header is present
    const autoSubmitted = body?.data?.headers?.['auto-submitted'] ?? body?.headers?.['auto-submitted'] ?? ''
    if (autoSubmitted && autoSubmitted !== 'no') {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const replyTo = extractEmail(from)
    const senderName = extractName(from)

    await resend.emails.send({
      from: 'misarroces <info@misarroces.es>',
      to: replyTo,
      subject: 'Hemos recibido tu mensaje — misarroces',
      html: buildEmailHtml(senderName),
      headers: {
        'Auto-Submitted': 'auto-replied',
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Inbound email webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

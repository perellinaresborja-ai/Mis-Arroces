'use server'

import { sendContactAutoReply, sendContactNotification } from '@/lib/email'
import { redirect } from 'next/navigation'

export async function sendContactForm(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const message = (formData.get('message') as string)?.trim()

  if (!name || !email || !message) {
    redirect('/contacto?error=Rellena todos los campos')
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    redirect('/contacto?error=Email no válido')
  }

  try {
    // Send both emails in parallel
    await Promise.all([
      sendContactAutoReply({ to: email, name }),
      sendContactNotification({ name, email, message }),
    ])
  } catch (err) {
    console.error('Error sending contact email:', err)
    redirect('/contacto?error=Error al enviar el mensaje. Inténtalo de nuevo.')
  }

  redirect('/contacto?ok=1')
}

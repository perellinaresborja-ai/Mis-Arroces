import Image from 'next/image'
import { sendContactForm } from './actions'
import { CheckCircle, AlertCircle, Mail, User, MessageSquare } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ContactoPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>
}) {
  const params = await searchParams
  const success = params.ok === '1'
  const error = params.error

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen w-screen bg-sand overflow-hidden">

      {/* LEFT — Visual */}
      <div className="hidden lg:flex relative w-3/5 h-full bg-charcoal items-center justify-center overflow-hidden">
        <Image
          src="/arroces/carneret.png"
          alt="Mis Arroces"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-transparent to-charcoal/80" />
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />

        <div className="absolute inset-0 flex flex-col p-12 md:p-16 lg:p-24 justify-end z-10">
          <div className="space-y-3">
            <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter text-cream drop-shadow-2xl leading-[0.9]">
              Hablemos<br />
              <span className="text-primary">de arroz.</span>
            </h1>
            <p className="text-xl text-cream/70 font-medium max-w-md drop-shadow-md leading-snug">
              Escríbenos y te respondemos lo antes posible.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="flex-1 flex flex-col items-center pt-8 lg:pt-[8vh] px-6 relative h-full overflow-y-auto">

        {/* Logo */}
        <div className="w-full max-w-sm flex flex-col items-center shrink-0 mb-6">
          <div className="relative w-[200px] h-[200px]">
            <Image
              src="/logofon.png"
              alt="misarroces"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="w-full max-w-sm">

          {success ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">¡Mensaje enviado!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Hemos recibido tu consulta y te hemos enviado un email de confirmación. Te responderemos lo antes posible.
              </p>
              <a
                href="/"
                className="inline-block mt-2 bg-primary text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Volver a misarroces
              </a>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-foreground">Contacta con nosotros</h2>
                <p className="text-muted-foreground text-sm">Te respondemos a la mayor brevedad.</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              <form action={sendContactForm} className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Nombre
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Tu nombre"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="¿En qué podemos ayudarte?"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white font-bold text-sm py-3.5 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all"
                >
                  Enviar mensaje
                </button>
              </form>

              <p className="text-center text-xs text-muted-foreground">
                También puedes escribirnos a{' '}
                <a href="mailto:info@misarroces.es" className="text-primary font-medium hover:underline">
                  info@misarroces.es
                </a>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

import Link from "next/link"

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 pt-16 min-h-screen">
      <Link href="/" className="text-primary hover:underline mb-8 inline-block font-medium">
        &larr; Volver a inicio
      </Link>
      
      <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">Política de Cookies</h1>
      
      <div className="prose prose-zinc dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
        <p className="text-lg font-medium text-foreground mb-8">
          En MisArroces (Celler Naziha S.L.) valoramos tu privacidad. Esta política explica qué son las cookies, cuáles utilizamos actualmente en nuestra plataforma y por qué. 
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. ¿Qué son las cookies?</h2>
        <p className="mb-4">
          Una cookie es un pequeño archivo de texto que se almacena en tu navegador cuando visitas casi cualquier página web o aplicación. Su utilidad es que la plataforma sea capaz de recordar tu visita cuando vuelvas a navegar por esa página, mantener tu sesión iniciada de forma segura o guardar tus preferencias técnicas.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Cookies que utilizamos en MisArroces</h2>
        <p className="mb-4">
          En la actualidad, nuestra Plataforma está diseñada bajo el principio de minimización y respeto a tu privacidad. <strong>Únicamente utilizamos tecnologías técnicas estrictamente necesarias</strong> para que la aplicación funcione y tecnologías analíticas de rendimiento técnico (first-party o exentas) que no recaban datos de identificación personal.
        </p>
        <p className="mb-4">
          Por este motivo, de acuerdo a la Ley de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI) y a las directrices de la Agencia Española de Protección de Datos (AEPD), nuestra Plataforma <strong>no requiere mostrar un banner de consentimiento previo</strong>, al estar exentas las cookies que utilizamos.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Cookies y almacenamiento estrictamente necesario</h3>
        <p className="mb-4">
          Utilizamos cookies propias y almacenamiento local (`localStorage` / `sessionStorage`) proporcionado por nuestra infraestructura (Supabase) con la única finalidad de:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Autenticarte de forma segura cuando inicias sesión (mantener el token de acceso cifrado).</li>
          <li>Identificar peticiones seguras desde tu cuenta hacia nuestros servidores para prevenir falsificaciones (seguridad).</li>
          <li>Recordar preferencias puramente técnicas de la interfaz (como el modo claro/oscuro).</li>
        </ul>
        <p className="mb-4">
          Estas tecnologías son imprescindibles. Si las desactivas manualmente en tu navegador, no podrás iniciar sesión ni usar las funcionalidades de tu cuenta en MisArroces.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Tecnologías de rendimiento (Vercel Speed Insights)</h3>
        <p className="mb-4">
          Utilizamos la infraestructura de alojamiento de Vercel y su módulo de rendimiento "Speed Insights". Esta herramienta mide métricas técnicas de velocidad de carga (Web Vitals) para ayudarnos a que la plataforma sea rápida. No utiliza cookies intrusivas, no rastrea tu navegación por otras webs, no recoge datos personales y anonimiza las IPs, cumpliendo con los estándares de exención técnica.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. ¿Qué cookies NO utilizamos actualmente?</h2>
        <p className="mb-4">
          Para tu tranquilidad, actualmente MisArroces <strong>no utiliza</strong>:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Cookies de analítica avanzada o seguimiento comercial (como Google Analytics 4, Meta Pixel, etc.).</li>
          <li>Cookies publicitarias o de remarketing.</li>
          <li>Tecnologías que compartan datos de navegación con terceros para elaborar perfiles.</li>
        </ul>
        <p className="mb-4">
          Si en el futuro decidimos incorporar herramientas de analítica general (ej. GA4) o de publicidad, actualizaremos previamente esta política y habilitaremos el correspondiente panel (banner) para que puedas otorgar o denegar tu consentimiento explícito antes de su instalación, de acuerdo con la normativa vigente.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Actualización y contacto</h2>
        <p className="mb-4">
          Esta Política de Cookies puede actualizarse. La versión actual es la 1.0 (Septiembre de 2026). Si tienes dudas sobre cómo gestionamos la parte técnica de tu sesión, puedes escribirnos a <a href="mailto:info@misarroces.es" className="text-primary hover:underline">info@misarroces.es</a>.
        </p>
      </div>
    </div>
  )
}

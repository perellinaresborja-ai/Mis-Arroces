import Link from "next/link"
import { CookiePreferencesButton } from "@/components/domain/CookiePreferencesButton"

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
          Utilizamos tecnologías propias y de terceros, que podemos clasificar según su finalidad en:
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Cookies y almacenamiento estrictamente necesario (Exentas)</h3>
        <p className="mb-4">
          Estas son imprescindibles para que la plataforma funcione. Si las desactivas manualmente en tu navegador, no podrás iniciar sesión ni usar las funcionalidades de tu cuenta en MisArroces. Su instalación no requiere consentimiento previo.
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Autenticación y seguridad:</strong> Almacenamiento local para mantener el token de acceso seguro (Supabase).</li>
          <li><strong>Preferencias técnicas:</strong> Recordar el modo claro/oscuro o si has aceptado/rechazado el banner de cookies.</li>
          <li><strong>Rendimiento (Speed Insights):</strong> Mide métricas técnicas de velocidad de carga (Web Vitals) de forma anónima, sin cookies intrusivas ni datos personales.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Cookies Analíticas (Requieren consentimiento)</h3>
        <p className="mb-4">
          Sólo las instalamos y utilizamos si nos has dado tu <strong>consentimiento explícito</strong> al pulsar "Aceptar" en nuestro banner.
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Google Analytics 4 (Google Ireland Limited):</strong> Nos ayuda a entender cómo navegas por la plataforma, de dónde proceden las visitas (adquisición) y qué recetas son más populares. Emplean transferencias internacionales a servidores de Google y tienen una duración de almacenamiento predeterminada configurable (normalmente 2 a 14 meses).</li>
          <li><strong>Cookie interna (misarroces_visitor_id):</strong> Cookie técnica propia de duración de 1 año (max-age). Aunque es propia, la utilizamos para personalizar algoritmos internos (Feed y Discover) y analizar el comportamiento incluso sin inicio de sesión, por lo que hemos decidido someterla a tu consentimiento analítico.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Gestión y revocación de cookies</h2>
        <p className="mb-4">
          Puedes cambiar tu decisión en cualquier momento desde el siguiente enlace:
        </p>
        <div className="my-6">
          <CookiePreferencesButton />
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Actualización y contacto</h2>
        <p className="mb-4">
          Esta Política de Cookies puede actualizarse. La versión actual es la 1.0 (Septiembre de 2026). Si tienes dudas sobre cómo gestionamos la parte técnica de tu sesión, puedes escribirnos a <a href="mailto:info@misarroces.es" className="text-primary hover:underline">info@misarroces.es</a>.
        </p>
      </div>
    </div>
  )
}

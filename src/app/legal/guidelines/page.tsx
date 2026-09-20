import Link from "next/link"

export default function GuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 pt-16 min-h-screen">
      <Link href="/" className="text-primary hover:underline mb-8 inline-block font-medium">
        &larr; Volver a inicio
      </Link>
      
      <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">Normas de la Comunidad</h1>
      
      <div className="prose prose-zinc dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
        <p className="text-lg font-medium text-foreground mb-8">
          MisArroces es una comunidad de amantes de la gastronomía. Para que este espacio siga siendo seguro, constructivo y agradable para todos, hemos establecido estas Normas de la Comunidad. Tu participación en la plataforma implica el compromiso de respetarlas.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Respeto y Convivencia</h2>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>No al acoso ni al odio:</strong> No toleramos el acoso, las amenazas, los insultos ni la intimidación hacia otros usuarios. Está estrictamente prohibido publicar contenido que incite al odio, la violencia o la discriminación por motivos de raza, religión, orientación sexual, género o cualquier otra condición.</li>
          <li><strong>Crítica constructiva:</strong> Se puede debatir sobre recetas y técnicas, pero las críticas deben ser gastronómicas y constructivas, nunca ataques personales.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Contenido Original y Derechos</h2>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Sé el autor de lo que publicas:</strong> Publica fotos, vídeos y textos que hayas creado tú mismo. No robes fotografías de otros blogs de cocina ni de redes sociales haciéndolas pasar por tuyas.</li>
          <li><strong>Respeto a la Privacidad:</strong> No publiques imágenes, vídeos ni datos personales (nombres reales, ubicaciones, contactos) de terceras personas sin su consentimiento expreso.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Spam y Comportamiento Abusivo</h2>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>No al Spam:</strong> MisArroces no es un tablón de anuncios. Está prohibido utilizar los comentarios, mensajes directos (DMs) o publicaciones para enviar publicidad no solicitada, enlaces fraudulentos (phishing) o promociones masivas ajenas a la gastronomía.</li>
          <li><strong>Cuentas falsas e impostores:</strong> No suplantes la identidad de otra persona, restaurante, chef o marca.</li>
          <li><strong>Manipulación de la plataforma:</strong> No utilices bots o sistemas automatizados para ganar seguidores, likes, o para extraer datos (scraping) de la plataforma de forma masiva.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Contenido Ilícito</h2>
        <p className="mb-4">
          Como plataforma regulada en la Unión Europea, tomamos muy en serio la prevención de actividades ilegales. Está terminantemente prohibido usar MisArroces para:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Compartir contenido que constituya un delito (terrorismo, explotación infantil, etc.).</li>
          <li>Vender o promocionar bienes y servicios ilegales.</li>
          <li>Infringir derechos de propiedad intelectual de forma sistemática.</li>
        </ul>
        <p className="mb-4">
          Cualquier usuario puede denunciar la presencia de contenido ilegal a través del <Link href="/legal/reportar" className="text-primary hover:underline">mecanismo habilitado para ello</Link>.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Moderación y Consecuencias</h2>
        <p className="mb-4">
          Nos reservamos el derecho de eliminar, ocultar o restringir cualquier contenido que incumpla estas normas. Si un usuario reitera en comportamientos que vulneran nuestras directrices, podemos suspender o eliminar su cuenta de forma temporal o permanente.
        </p>
        <p className="mb-4">
          Si ves algo que incumple estas normas, por favor utiliza la opción de "Reportar" integrada en todas las publicaciones y perfiles. Un equipo revisará el caso y tomará las medidas oportunas.
        </p>
      </div>
    </div>
  )
}

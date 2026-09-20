import Link from "next/link"

export default function AvisoLegalPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 pt-16 min-h-screen">
      <Link href="/" className="text-primary hover:underline mb-8 inline-block font-medium">
        &larr; Volver a inicio
      </Link>
      
      <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">Aviso Legal</h1>
      
      <div className="prose prose-zinc dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
        <p className="text-lg font-medium text-foreground mb-8">
          En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa a los usuarios de los datos identificativos del titular de esta plataforma:
        </p>

        <div className="bg-muted/50 p-6 rounded-2xl mb-8 border border-border">
          <ul className="space-y-3">
            <li><strong>Titular:</strong> Celler Naziha S.L.</li>
            <li><strong>NIF/CIF:</strong> B54936604</li>
            <li><strong>Domicilio:</strong> Calle Benimantell, 10, 03530 La Nucía, Alicante, España</li>
            <li><strong>Correo electrónico:</strong> <a href="mailto:info@misarroces.es" className="text-primary hover:underline">info@misarroces.es</a></li>
            <li><strong>Sitio Web:</strong> <a href="https://www.misarroces.es" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.misarroces.es</a></li>
          </ul>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Objeto y Condiciones Generales de Uso</h2>
        <p className="mb-4">
          Este Aviso Legal regula el acceso y la utilización de la plataforma digital MisArroces (en adelante, la "Plataforma"), de la que Celler Naziha S.L. es titular. La Plataforma ofrece a los usuarios un espacio social enfocado en la gastronomía del arroz, donde pueden crear perfiles, compartir recetas, publicar contenidos multimedia e interactuar con la comunidad.
        </p>
        <p className="mb-4">
          El acceso a la Plataforma atribuye la condición de Usuario e implica la aceptación plena y sin reservas de todas las disposiciones incluidas en el presente Aviso Legal, así como de nuestros <Link href="/legal/terms" className="text-primary hover:underline">Términos de Servicio</Link> y <Link href="/legal/privacy" className="text-primary hover:underline">Política de Privacidad</Link>. La Plataforma está dirigida exclusivamente a usuarios mayores de 18 años.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Propiedad Intelectual e Industrial</h2>
        <p className="mb-4">
          La Plataforma y todos sus contenidos, incluyendo a título enunciativo pero no limitativo, el diseño gráfico, código fuente, logotipos, textos, gráficos e ilustraciones (con excepción del contenido generado por los propios usuarios), son propiedad exclusiva de Celler Naziha S.L. o de terceros que han autorizado expresamente su uso, estando protegidos por la normativa de propiedad intelectual e industrial.
        </p>
        <p className="mb-4">
          Queda expresamente prohibida la reproducción, distribución, comunicación pública y transformación de la totalidad o parte de los contenidos corporativos de esta web, con fines comerciales, sin la autorización previa y por escrito de Celler Naziha S.L.
        </p>
        <p className="mb-4">
          En cuanto al contenido generado por los Usuarios (UGC, por sus siglas en inglés), el Usuario conserva la plena titularidad y los derechos de propiedad intelectual sobre las fotografías, vídeos, recetas y textos que publique en la Plataforma, concediendo a Celler Naziha S.L. únicamente una licencia no exclusiva y limitada a las finalidades técnicas y operativas necesarias para el funcionamiento del servicio, tal como se especifica detalladamente en los Términos de Servicio.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Responsabilidad sobre el Contenido de los Usuarios y la DSA</h2>
        <p className="mb-4">
          Celler Naziha S.L. actúa como prestador de servicios de alojamiento de datos (hosting) conforme a la Ley de Servicios de la Sociedad de la Información (LSSI) y al Reglamento Europeo de Servicios Digitales (DSA). No asume la responsabilidad del contenido alojado a petición de los usuarios, siempre que no tenga conocimiento efectivo de que la actividad o la información es ilícita.
        </p>
        <p className="mb-4">
          En caso de tener conocimiento efectivo de la existencia de contenido presuntamente ilícito o que vulnere derechos de terceros, Celler Naziha S.L. actuará con diligencia para retirarlo o bloquear el acceso a este. Hemos habilitado un <Link href="/legal/reportar" className="text-primary hover:underline">mecanismo electrónico de notificación (Notice and Takedown)</Link> accesible para que cualquier persona o entidad informe sobre la presencia de contenido ilícito.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Enlaces a Terceros (Links)</h2>
        <p className="mb-4">
          La Plataforma puede contener enlaces (links) a otras páginas web gestionadas por terceros. Celler Naziha S.L. no ejerce ningún tipo de control sobre dichos sitios y contenidos, y en ningún caso asumirá responsabilidad alguna por los contenidos de algún enlace perteneciente a un sitio web ajeno, ni garantizará la disponibilidad técnica, calidad, fiabilidad, exactitud o veracidad de cualquier material o información contenida en ninguno de dichos hipervínculos.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Legislación Aplicable y Jurisdicción</h2>
        <p className="mb-4">
          La relación entre Celler Naziha S.L. y el Usuario se regirá por la normativa española vigente. En caso de disputa o controversia relacionada con el uso de la Plataforma, las partes se someten, con renuncia expresa a cualquier otro fuero, a los Juzgados y Tribunales competentes del domicilio del Usuario si este tiene la condición de consumidor. En caso contrario, la sumisión será a los Juzgados y Tribunales de Alicante (España).
        </p>
      </div>
    </div>
  )
}

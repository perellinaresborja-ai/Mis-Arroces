const fs = require('fs');

const termsContent = `import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto p-8 pt-16 min-h-screen">
      <Link href="/" className="text-primary hover:underline mb-8 inline-block font-medium">
        &larr; Volver a inicio
      </Link>
      
      <h1 className="text-4xl font-bold font-serif mb-8 text-foreground">Condiciones de Uso</h1>
      
      <div className="prose prose-stone max-w-none text-muted-foreground">
        <p className="lead text-lg mb-8">
          Bienvenido a MisArroces. Las presentes Condiciones de Uso rigen el acceso y uso de nuestra plataforma y servicios asociados, de conformidad con la legislación española y la normativa de la Unión Europea aplicable.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Aceptación y Capacidad</h2>
        <p className="mb-4">
          Al registrarte, acceder o utilizar la plataforma MisArroces (en adelante, "la Plataforma"), aceptas íntegramente las presentes Condiciones de Uso. Si no estás de acuerdo con ellas, no debes utilizar nuestros servicios. Para crear una cuenta y usar la Plataforma, debes ser mayor de catorce (14) años o contar con el consentimiento expreso de tus padres o tutores legales, tal como lo establece la legislación vigente.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Objeto de la Plataforma</h2>
        <p className="mb-4">
          MisArroces es una red social y comunidad gastronómica diseñada para compartir, descubrir e interactuar en torno a recetas, elaboraciones y consejos sobre la cocción de arroces. La Plataforma ofrece herramientas de creación, publicación de contenido multimedia y sistemas de mensajería (DMs).
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Registro y Cuentas de Usuario</h2>
        <p className="mb-4">
          Para acceder a ciertas funcionalidades (publicar recetas, interacciones sociales, etc.), es necesario registrarse proporcionando información veraz, actual y completa. Eres el único responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta. MisArroces se reserva el derecho de suspender o cancelar cuentas que incumplan estas condiciones o aporten información falsa.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Propiedad Intelectual y Contenido Generado por el Usuario (UGC)</h2>
        <p className="mb-4">
          <strong>Propiedad del Contenido:</strong> Tú retienes todos los derechos de propiedad intelectual sobre el contenido (textos, fotografías, vídeos, recetas) que subas a MisArroces.
        </p>
        <p className="mb-4">
          <strong>Licencia de Uso:</strong> Al subir contenido a la Plataforma, nos concedes una licencia mundial, no exclusiva, gratuita y transferible para alojar, almacenar, usar, reproducir, modificar (para fines técnicos de formateo y optimización), mostrar públicamente y distribuir dicho contenido en MisArroces y plataformas de terceros relacionadas, con el único fin de prestar y promocionar el servicio.
        </p>
        <p className="mb-4">
          <strong>Responsabilidad del Contenido:</strong> Garantizas que posees los derechos necesarios sobre todo el contenido que publicas y que éste no infringe derechos de propiedad intelectual, marcas, intimidad ni honor de terceros.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Reglas de Conducta (DSA y Normativa Europea)</h2>
        <p className="mb-4">
          Al utilizar MisArroces, te comprometes a <strong>no</strong> realizar las siguientes acciones:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Publicar contenido ilícito, difamatorio, amenazante, que incite al odio o que sea considerado spam.</li>
          <li>Compartir contenido protegido por derechos de autor sin autorización expresa del titular.</li>
          <li>Utilizar la Plataforma para acosar, suplantar identidades o realizar actividades fraudulentas.</li>
          <li>Emplear sistemas automatizados (bots, scrapers) para extraer datos de la Plataforma sin nuestro consentimiento expreso.</li>
        </ul>
        <p className="mb-4">
          De acuerdo con el Reglamento de Servicios Digitales (DSA), MisArroces actúa como prestador de servicios de alojamiento de datos. Nos reservamos el derecho de retirar o restringir el acceso a contenido que, bajo nuestro criterio o mediante notificación fundamentada, infrinja nuestras normas o la legalidad vigente.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">6. Modificaciones del Servicio y de las Condiciones</h2>
        <p className="mb-4">
          Nos esforzamos por mejorar MisArroces continuamente. Podemos añadir, modificar o eliminar funciones de la Plataforma en cualquier momento. Asimismo, podemos actualizar estas Condiciones de Uso. Cualquier cambio sustancial será notificado a través de la Plataforma o por correo electrónico. El uso continuado tras la actualización implica su aceptación.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">7. Limitación de Responsabilidad</h2>
        <p className="mb-4">
          MisArroces no se hace responsable de daños indirectos, pérdida de datos ni fallos de seguridad originados en dispositivos del usuario. La Plataforma se proporciona "tal cual", sin garantías expresas o implícitas sobre su disponibilidad ininterrumpida o infalibilidad técnica. Las recetas publicadas son orientativas; no nos hacemos responsables de alergias o problemas derivados de la manipulación de alimentos por parte de los usuarios.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">8. Ley Aplicable y Jurisdicción</h2>
        <p className="mb-4">
          Estas Condiciones de Uso se regirán por la legislación común española y la normativa de la Unión Europea. Para la resolución de cualquier conflicto que pudiera derivarse del uso de la Plataforma, las partes se someten a los juzgados y tribunales del domicilio del usuario consumidor, o bien de la ciudad de Madrid en caso de usuarios profesionales o de empresa.
        </p>

        <p className="text-sm mt-12 pt-8 border-t border-border">
          Última actualización: Agosto de 2026
        </p>
      </div>
    </div>
  )
}
`;

fs.writeFileSync('src/app/legal/terms/page.tsx', termsContent);
console.log("UPDATED TERMS");

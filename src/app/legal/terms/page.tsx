import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 pt-16 min-h-screen">
      <Link href="/" className="text-primary hover:underline mb-8 inline-block font-medium">
        &larr; Volver a inicio
      </Link>
      
      <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">Términos de Servicio</h1>
      
      <div className="prose prose-zinc dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
        <p className="text-lg font-medium text-foreground mb-8">
          Bienvenido a MisArroces, una plataforma social donde los amantes de la gastronomía pueden compartir y descubrir recetas. Al utilizar nuestros servicios, aceptas estos Términos de Servicio.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Naturaleza del Servicio</h2>
        <p className="mb-4">
          MisArroces es una red social y gestor de recetas. Permitimos a los usuarios crear perfiles (públicos o privados), publicar recetas paso a paso, subir fotografías y vídeos, compartir "Stories" efímeras, reaccionar, guardar contenido, comentar y enviarse mensajes privados directos.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Edad Mínima y Registro (+18)</h2>
        <p className="mb-4">
          Para registrarte y utilizar MisArroces <strong>debes tener 18 años o más</strong>. No permitimos la creación de cuentas a menores de edad. Al registrarte, confirmas bajo tu responsabilidad legal cumplir con este requisito. Nos reservamos el derecho a suspender o eliminar cualquier cuenta que razonablemente sospechemos pertenece a un menor.
        </p>
        <p className="mb-4">
          Eres responsable de mantener la seguridad de tu cuenta, tu contraseña y de toda la actividad que ocurra bajo ella. Debes elegir un nombre de usuario (`username`) y nombre visible (`display_name`) que no vulnere marcas registradas ni supplante identidades.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Derechos sobre el Contenido</h2>
        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.1. Tu propiedad</h3>
        <p className="mb-4">
          En MisArroces creemos en proteger a los creadores. <strong>Tú conservas todos los derechos de propiedad intelectual, derechos de autor y derechos de imagen que legalmente te correspondan</strong> sobre las fotografías, vídeos, recetas, textos y cualquier otro contenido que publiques en la plataforma. MisArroces NO adquiere la propiedad de tu contenido.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.2. Licencia otorgada a MisArroces</h3>
        <p className="mb-4">
          Para que el servicio pueda funcionar técnicamente, nos concedes una licencia no exclusiva, libre de regalías, mundial y limitada. Esta licencia nos permite exclusivamente:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Alojar y almacenar tus archivos en nuestros servidores (Supabase).</li>
          <li>Reproducir y adaptar formatos/tamaños (ej. generar miniaturas, optimizar imágenes para carga rápida).</li>
          <li>Mostrar y distribuir el contenido públicamente o privadamente dentro de MisArroces, según la configuración de privacidad de tu perfil.</li>
          <li>Permitir que otros usuarios utilicen las funciones de compartir propias de la plataforma (ej. enviar una de tus recetas por mensaje privado o compartir tu historia si así lo permite el diseño).</li>
        </ul>
        <p className="mb-4">
          <strong>Límites estrictos:</strong> NO nos concedes derechos para vender tu contenido, sublicenciarlo con fines comerciales ajenos a la plataforma, ni utilizar tus recetas o fotos en campañas publicitarias externas sin pedirte un permiso adicional explícito.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.3. Tus responsabilidades</h3>
        <p className="mb-4">
          Al publicar contenido, garantizas que dispones de los permisos, licencias y autorizaciones necesarias. Eres el único responsable si publicas contenido que vulnera el derecho al honor, la intimidad o los derechos de autor de terceros.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Normas de la Comunidad y Moderación</h2>
        <p className="mb-4">
          Todos los usuarios deben respetar las <Link href="/normas-comunidad" className="text-primary hover:underline">Normas de la Comunidad</Link>. La plataforma cuenta con sistemas de reporte para señalar infracciones.
        </p>
        <p className="mb-4">
          En caso de detectar contenido que vulnere estas normas, MisArroces se reserva el derecho de restringir su visibilidad o eliminarlo. Ante infracciones graves o reiteradas, podemos suspender o cerrar tu cuenta permanentemente.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Contenido Presuntamente Ilícito (DSA)</h2>
        <p className="mb-4">
          Conforme a la normativa europea de Servicios Digitales (DSA), actuamos como intermediarios de alojamiento de datos. Si detectas contenido que vulnera la legalidad vigente, puedes notificarlo a través de nuestro <Link href="/legal/reportar" className="text-primary hover:underline">mecanismo de aviso electrónico</Link>. Tras recibir una notificación validada, revisaremos el caso y tomaremos las medidas oportunas de retirada o bloqueo si procede, notificando a las partes implicadas.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">6. Eliminación de la Cuenta</h2>
        <p className="mb-4">
          Puedes eliminar tu cuenta en cualquier momento desde los Ajustes. Al hacerlo, se borrarán de forma irreversible tu perfil, publicaciones, recetas, historias, reacciones y los archivos multimedia asociados que poseas físicamente en nuestros servidores. 
        </p>
        <p className="mb-4">
          <strong>Nota sobre Mensajes Privados (DMs):</strong> Si eliminas tu cuenta, todos los mensajes privados que enviaste desaparecerán inmediatamente y dejarán de ser visibles tanto para ti como para tus destinatarios. Sin embargo, los mensajes que otros te hayan enviado seguirán existiendo en las bases de datos al ser propiedad del otro usuario.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">7. Disponibilidad y Modificaciones</h2>
        <p className="mb-4">
          MisArroces se ofrece "tal cual". Hacemos todo lo posible por mantener la plataforma operativa, pero no podemos garantizar un servicio ininterrumpido o libre de errores. Nos reservamos el derecho de añadir o retirar funcionalidades del servicio, así como de modificar estos Términos en cualquier momento. Te notificaremos sobre cambios sustanciales antes de que entren en vigor, debiendo aceptarlos para poder continuar usando la plataforma.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">8. Marco Jurídico y Contacto</h2>
        <p className="mb-4">
          Estos Términos se rigen por la legislación española. Para la resolución de conflictos, si actúas como consumidor, podrás acudir a los tribunales de tu domicilio. 
        </p>
        <p className="mb-4">
          Para dudas, problemas o cuestiones legales, contáctanos en: <a href="mailto:info@misarroces.es" className="text-primary hover:underline">info@misarroces.es</a>
        </p>

        <p className="text-sm mt-12 pt-8 border-t border-border">
          Versión: 2.0<br/>
          Última actualización: Septiembre de 2026
        </p>
      </div>
    </div>
  )
}

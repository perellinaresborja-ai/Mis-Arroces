import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 pt-16 min-h-screen">
      <Link href="/" className="text-primary hover:underline mb-8 inline-block font-medium">
        &larr; Volver a inicio
      </Link>
      
      <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">Política de Privacidad</h1>
      
      <div className="prose prose-zinc dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
        <p className="text-lg font-medium text-foreground mb-8">
          Esta Política detalla cómo Celler Naziha S.L. trata y protege tus datos personales al utilizar MisArroces, cumpliendo estrictamente con el Reglamento General de Protección de Datos (RGPD) y la LOPDGDD.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Responsable del Tratamiento</h2>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Identidad:</strong> Celler Naziha S.L.</li>
          <li><strong>NIF:</strong> B54936604</li>
          <li><strong>Domicilio Postal:</strong> Calle Benimantell, 10, 03530 La Nucía, Alicante, España.</li>
          <li><strong>Contacto Privacidad:</strong> <a href="mailto:info@misarroces.es" className="text-primary hover:underline">info@misarroces.es</a></li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. ¿Qué datos tratamos, para qué y con qué base jurídica?</h2>
        <p className="mb-4">
          La base principal que nos permite tratar tus datos es la <strong>ejecución del contrato</strong> que suscribes con nosotros al aceptar nuestros Términos de Servicio. Tratar los datos descritos a continuación es imprescindible para prestar el servicio técnico y social que ofrece la Plataforma. 
        </p>
        
        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">A. Datos de tu Cuenta y Perfil</h3>
        <p className="mb-4">
          Para registrarte solicitamos obligatoriamente tu correo electrónico y una contraseña segura, generando un identificador único (UID). Posteriormente puedes configurar tu nombre de usuario, foto de perfil (avatar) y una breve biografía. Estos datos son necesarios para <strong>proporcionar el servicio (Ejecución de contrato)</strong>. 
        </p>
        <p className="mb-4">
          El requisito de ser mayor de 18 años se recoge sin almacenar tu fecha de nacimiento completa (por el principio de minimización), guardando únicamente una confirmación electrónica y su marca de tiempo (timestamp) para cumplir nuestras <strong>obligaciones legales</strong>.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">B. Contenido Generado, Interacciones y Mensajes</h3>
        <p className="mb-4">
          Recopilamos las recetas, elaboraciones, fotografías, vídeos, comentarios, "me gusta", tus listas de compra, y a quién sigues/quién te sigue. Esto es el núcleo de MisArroces y se basa en la <strong>ejecución de contrato</strong>. 
        </p>
        <p className="mb-4">
          <strong>Mensajería Privada (DMs):</strong> MisArroces facilita mensajes directos entre usuarios. Al no ser un servicio de mensajería cifrado de extremo a extremo, los mensajes y adjuntos multimedia se almacenan de forma segura en nuestras bases de datos bajo estrictos controles de acceso (RLS), pero permanecen en texto plano técnico para poder operar la entrega, notificaciones y reportes de moderación.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">C. Datos de Moderación, Seguridad y Analítica</h3>
        <p className="mb-4">
          Tratamos eventos internos de uso (ej. cuándo ves una historia), reportes de moderación, bloqueos de usuarios y listas de palabras silenciadas. Para ello nos amparamos en la <strong>ejecución de contrato y nuestro interés legítimo</strong> en prevenir abusos, resolver incidencias técnicas y asegurar que la red es un entorno seguro.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">D. Comunicaciones</h3>
        <p className="mb-4">
          Utilizamos tu email para enviar correos de seguridad, recuperación de contraseña y avisos de servicio esenciales (ejecución de contrato). MisArroces NO utiliza tus datos para enviarte marketing de terceros ni para suscribirte forzosamente a newsletters publicitarias.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. ¿Con quién compartimos tus datos? (Proveedores)</h2>
        <p className="mb-4">
          Para poder prestar el servicio de forma estable, nos apoyamos en infraestructuras tecnológicas punteras que actúan como nuestros Encargados de Tratamiento:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Supabase:</strong> Alojamiento de las bases de datos (PostgreSQL), la autenticación segura y el almacenamiento físico (Storage) de todos tus archivos multimedia.</li>
          <li><strong>Vercel:</strong> Despliegue de la aplicación web y uso de "Speed Insights" (análisis técnico del rendimiento que mide la velocidad de carga de forma anónima, sin usar cookies intrusivas ni trazar usuarios).</li>
          <li><strong>Resend:</strong> Plataforma para enviar correos electrónicos transaccionales del sistema.</li>
        </ul>
        <p className="mb-4">
          No vendemos ni comercializamos tus datos a terceros. Cualquier transferencia internacional originada por el uso de estos proveedores (ej. servidores en EE.UU.) está amparada bajo marcos de adecuación o cláusulas contractuales tipo según la normativa europea.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Retención de los datos y Eliminación de Cuenta</h2>
        <p className="mb-4">
          Tus datos se conservarán mientras tu cuenta permanezca activa. Cuando decidas ejercer tu derecho de supresión eliminando tu cuenta a través de los Ajustes, nuestro sistema destruirá automáticamente tu perfil, publicaciones, recetas y fotos físicas almacenadas en el Storage, así como los mensajes que tú hayas enviado en chats privados.
        </p>
        <p className="mb-4">
          Algunos datos limitados pueden conservarse anonimizados (como las estadísticas de tráfico general sin vinculación a tu identidad), o bloqueados el tiempo estrictamente necesario si existe una obligación legal de retención frente a autoridades (ej. registros de conexión).
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Tus Derechos</h2>
        <p className="mb-4">
          La legislación te reconoce el derecho a acceder, rectificar, suprimir, limitar, u oponerte al tratamiento de tus datos, así como a la portabilidad de los mismos.
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Acceso y Portabilidad:</strong> Puedes descargar un archivo con tu información directamente desde la sección "Descargar mis datos" en los Ajustes de Seguridad.</li>
          <li><strong>Supresión:</strong> Puedes eliminar todos tus datos irreversiblemente mediante el botón "Eliminar cuenta".</li>
          <li>Para cualquier duda o el ejercicio formal de otros derechos, contacta en <a href="mailto:info@misarroces.es" className="text-primary hover:underline">info@misarroces.es</a>, adjuntando prueba de identidad.</li>
        </ul>
        <p className="mb-4">
          Si consideras que no hemos tratado tus datos adecuadamente, tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD).
        </p>

        <p className="text-sm mt-12 pt-8 border-t border-border">
          Versión: 2.0<br/>
          Última actualización: Septiembre de 2026
        </p>
      </div>
    </div>
  )
}

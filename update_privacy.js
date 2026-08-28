const fs = require('fs');

const privacyContent = `import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto p-8 pt-16 min-h-screen">
      <Link href="/" className="text-primary hover:underline mb-8 inline-block font-medium">
        &larr; Volver a inicio
      </Link>
      
      <h1 className="text-4xl font-bold font-serif mb-8 text-foreground">Política de Privacidad</h1>
      
      <div className="prose prose-stone max-w-none text-muted-foreground">
        <p className="lead text-lg mb-8">
          En MisArroces, tu privacidad es una prioridad. Esta política detalla de manera transparente cómo recabamos, utilizamos y protegemos tus datos personales, de estricto cumplimiento con el Reglamento General de Protección de Datos (RGPD) de la UE.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Responsable del Tratamiento</h2>
        <p className="mb-4">
          La entidad responsable del tratamiento de tus datos es MisArroces (en adelante, "nosotros" o "la Plataforma"). Puedes contactar con nuestro equipo de privacidad a través de [correo de contacto pendiente] para cualquier duda o ejercicio de tus derechos.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. ¿Qué datos recopilamos?</h2>
        <p className="mb-4">Recopilamos la información mínima necesaria para que la plataforma funcione adecuadamente y ofrezca una experiencia personalizada:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Datos de Identificación y Contacto:</strong> Nombre de usuario, dirección de correo electrónico y contraseña encriptada (proporcionados al registrarte).</li>
          <li><strong>Datos de Perfil:</strong> Fotografía de perfil, biografía, enlaces a redes sociales y preferencias de cuenta.</li>
          <li><strong>Contenido Generado por el Usuario (UGC):</strong> Recetas, fotografías, vídeos, comentarios, "me gusta" y mensajes directos.</li>
          <li><strong>Datos Técnicos y de Navegación:</strong> Dirección IP, tipo de dispositivo, navegador, zona horaria y datos de analítica de uso interno (visualizaciones de historias, interacciones) para el rendimiento del servicio.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Finalidad del Tratamiento de los Datos</h2>
        <p className="mb-4">Tus datos son tratados exclusivamente para los siguientes fines:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Prestación del Servicio:</strong> Crear tu cuenta, publicar tu contenido, gestionar tus interacciones y asegurar el correcto funcionamiento de mensajería e historias. (Base legal: Ejecución de un contrato).</li>
          <li><strong>Seguridad y Soporte:</strong> Prevenir fraudes, identificar cuentas maliciosas y proporcionarte soporte técnico. (Base legal: Interés legítimo).</li>
          <li><strong>Comunicaciones Legales y de Servicio:</strong> Notificarte sobre actualizaciones importantes en nuestras políticas o vulnerabilidades. (Base legal: Obligación legal).</li>
          <li><strong>Personalización y Analítica:</strong> Mejorar la precisión del algoritmo del Feed y descubrir problemas en la UI de la aplicación. (Base legal: Consentimiento explícito).</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. ¿Con quién compartimos tus datos?</h2>
        <p className="mb-4">
          MisArroces no vende ni alquila tus datos personales a terceros. Compartimos datos de forma estrictamente limitada con:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Proveedores de Servicios Cloud:</strong> Nuestro backend y base de datos están alojados en Supabase (AWS), quien actúa como encargado de tratamiento cumpliendo con altos estándares de seguridad y con cláusulas contractuales tipo si existiesen transferencias internacionales.</li>
          <li><strong>Autoridades Competentes:</strong> Solo en caso de que una autoridad legal u orden judicial exija acceso a cierta información, siguiendo la legalidad vigente de la UE.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Conservación de tus Datos</h2>
        <p className="mb-4">
          Conservaremos tus datos personales mientras mantengas tu cuenta activa en MisArroces. Las historias efímeras (Stories) se eliminan automáticamente de nuestros servidores públicos pasadas 24 horas, aunque pueden quedar registradas en nuestros backups cifrados durante un breve periodo por motivos técnicos de rotación.
          Si decides eliminar tu cuenta, tus datos personales serán bloqueados y posteriormente destruidos, a excepción de aquella información que debamos retener por obligación legal o defensa ante reclamaciones.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">6. Tus Derechos (RGPD)</h2>
        <p className="mb-4">
          Bajo la normativa europea, dispones del control absoluto sobre tus datos. Puedes ejercer en cualquier momento los siguientes derechos:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Derecho de Acceso:</strong> Solicitar una copia de los datos que tenemos sobre ti.</li>
          <li><strong>Derecho de Rectificación:</strong> Modificar información inexacta a través de la configuración de tu perfil.</li>
          <li><strong>Derecho de Supresión (Derecho al Olvido):</strong> Solicitar el borrado íntegro de tu cuenta y datos asociados.</li>
          <li><strong>Derecho de Oposición y Limitación:</strong> Oponerte a tratamientos específicos de tus datos, como análisis estadísticos.</li>
          <li><strong>Derecho a la Portabilidad:</strong> Solicitar tus datos en un formato estructurado y de uso común.</li>
        </ul>
        <p className="mb-4">
          Para ejercer cualquiera de estos derechos, dirígete al menú de configuración en la Plataforma, o en su defecto, ponte en contacto con nosotros.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">7. Medidas de Seguridad</h2>
        <p className="mb-4">
          Aplicamos medidas organizativas y tecnológicas, como el cifrado en tránsito (TLS/SSL), la securización a nivel de fila en base de datos (RLS) y autenticación segura para garantizar la integridad y confidencialidad de tu información personal.
        </p>

        <p className="text-sm mt-12 pt-8 border-t border-border">
          Última actualización: Agosto de 2026
        </p>
      </div>
    </div>
  )
}
`;

fs.writeFileSync('src/app/legal/privacy/page.tsx', privacyContent);
console.log("UPDATED PRIVACY");

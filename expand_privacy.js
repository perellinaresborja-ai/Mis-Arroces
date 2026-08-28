const fs = require('fs');

const privacyContent = `import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 pt-16 min-h-screen">
      <Link href="/" className="text-primary hover:underline mb-8 inline-block font-medium">
        &larr; Volver a inicio
      </Link>
      
      <h1 className="text-4xl font-bold font-serif mb-8 text-foreground">Política de Privacidad y Cookies</h1>
      
      <div className="prose prose-stone max-w-none text-muted-foreground">
        <p className="lead text-lg mb-8">
          En MisArroces, creemos firmemente que la privacidad es un derecho fundamental. Hemos redactado este documento con la máxima transparencia para explicarte cómo recopilamos, tratamos, almacenamos y protegemos tus datos, en pleno y estricto cumplimiento del <strong>Reglamento (UE) 2016/679 (Reglamento General de Protección de Datos o RGPD)</strong> y la <strong>Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD)</strong>.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Identidad del Responsable del Tratamiento</h2>
        <p className="mb-4">
          La entidad jurídica responsable del tratamiento de los datos personales recogidos en esta Plataforma es:<br/><br/>
          <strong>Denominación Social:</strong> MisArroces Community (Datos pendientes de registro mercantil)<br/>
          <strong>Domicilio:</strong> España<br/>
          <strong>Correo de contacto DPO (Delegado de Protección de Datos):</strong> privacidad@misarroces.com
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Categorías de Datos Personales que Recopilamos</h2>
        <p className="mb-4">No recolectamos datos sensibles. Solo solicitamos la información estrictamente necesaria para garantizar el correcto funcionamiento del ecosistema social:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Datos de Registro y Autenticación:</strong> Tu dirección de correo electrónico, contraseña (encriptada irreversiblemente con Argon2/Bcrypt) y Nombre de Usuario (handle).</li>
          <li><strong>Datos Biográficos (Opcionales):</strong> Fotografía de perfil, imagen de cabecera, nombre a mostrar, biografía y enlaces públicos a tus otras redes. Al añadirlos, consientes explícitamente su visualización pública.</li>
          <li><strong>Datos Generados (UGC - User Generated Content):</strong> Cualquier receta, imagen, fotografía de sesión (Cooking), vídeo temporal (Story) o mensaje directo (DM) que emitas en la plataforma.</li>
          <li><strong>Datos Transaccionales e Interacciones:</strong> Guardados en colecciones (Bookmarks), "Me gusta" (Likes), perfiles que sigues, comentarios y métricas de visualización (qué historias has visto).</li>
          <li><strong>Datos Técnicos de Conexión:</strong> Tu dirección IP, tipo y versión del navegador, identificadores de dispositivo, información del sistema operativo, cookies técnicas de sesión y datos de uso de la app.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Finalidades y Bases Legitimadoras del Tratamiento</h2>
        <p className="mb-4">Tratamos tus datos bajo las siguientes bases legales de licitud estipuladas en el Art. 6 del RGPD:</p>
        
        <div className="overflow-x-auto my-6">
          <table className="w-full text-sm text-left border-collapse border border-border rounded-lg overflow-hidden">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="p-3 border border-border">Finalidad del Tratamiento</th>
                <th className="p-3 border border-border">Datos Implicados</th>
                <th className="p-3 border border-border">Base Legal (Licitud)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border border-border">Crear tu cuenta, autenticar tus accesos y proporcionar el servicio base de red social (publicación e interacción).</td>
                <td className="p-3 border border-border">Registro, Biográficos, UGC, Transaccionales.</td>
                <td className="p-3 border border-border"><strong>Ejecución de un contrato</strong> (Aceptación de Términos de Uso).</td>
              </tr>
              <tr>
                <td className="p-3 border border-border">Garantizar la seguridad, prevenir fraudes, bots, spam y caídas técnicas.</td>
                <td className="p-3 border border-border">Técnicos de Conexión (IP), Transaccionales.</td>
                <td className="p-3 border border-border"><strong>Interés legítimo</strong> de la plataforma.</td>
              </tr>
              <tr>
                <td className="p-3 border border-border">Analítica interna de la app y algoritmos de recomendación en el Feed (Discover).</td>
                <td className="p-3 border border-border">Transaccionales, Técnicos de uso.</td>
                <td className="p-3 border border-border"><strong>Consentimiento explícito</strong> o Interés Legítimo en función del caso.</td>
              </tr>
              <tr>
                <td className="p-3 border border-border">Atender solicitudes de cuerpos y fuerzas de seguridad del Estado.</td>
                <td className="p-3 border border-border">Cualquiera de los anteriores que sean requeridos.</td>
                <td className="p-3 border border-border"><strong>Obligación Legal</strong>.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Destinatarios y Subencargados del Tratamiento</h2>
        <p className="mb-4">
          MisArroces no vende ni comercializa tu información. Para poder prestar el servicio de manera eficiente y escalable, compartimos acceso de forma encriptada con los siguientes proveedores clave (Encargados de Tratamiento):
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Supabase, Inc. (AWS):</strong> Proveedor principal de la infraestructura backend, base de datos PostgreSQL, autenticación y almacenamiento de objetos en la nube (Storage).</li>
          <li><strong>Vercel, Inc.:</strong> Plataforma de alojamiento del Frontend y edge-computing (enrutamiento de datos).</li>
        </ul>
        <p className="mb-4">
          Transferencias Internacionales: Dado que algunos de nuestros proveedores pueden operar desde Estados Unidos, nos aseguramos de que dichas transferencias se realicen amparadas bajo el <em>Data Privacy Framework (DPF)</em> o mediante la formalización de Cláusulas Contractuales Tipo (SCC) aprobadas por la Comisión Europea.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Retención de Datos y Ciclo de Vida</h2>
        <p className="mb-4">
          Conservaremos tus datos personales únicamente durante el tiempo estrictamente necesario para cumplir con los fines mencionados:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Datos de cuenta y perfil:</strong> Mientras tu cuenta permanezca activa.</li>
          <li><strong>Historias efímeras (Stories):</strong> Se marcan como caducadas pasadas las 24 horas y los archivos multimedia son limpiados físicamente del Storage mediante tareas programadas.</li>
          <li><strong>Baja del Usuario:</strong> Si decides eliminar tu cuenta, se procederá al bloqueo de tus datos (haciéndolos inaccesibles al público). Solamente se retendrán durante el plazo legal de prescripción de responsabilidades (por lo general, un máximo de 5 años bajo normativas civiles y penales). Transcurrido ese tiempo, se borrarán definitivamente de la BDD primaria y de los backups en cascada.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">6. Tus Derechos (ARSOL y Portabilidad)</h2>
        <p className="mb-4">
          Como usuario, la legislación europea te otorga un control total sobre tu información. Puedes ejercer gratuitamente los siguientes derechos escribiendo a nuestro correo de privacidad o usando las herramientas integradas en tu Perfil:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Derecho de Acceso:</strong> Conocer qué datos personales estamos tratando y solicitar una copia.</li>
          <li><strong>Derecho de Rectificación:</strong> Corregir información inexacta o incompleta.</li>
          <li><strong>Derecho de Supresión (Olvido):</strong> Eliminar tu cuenta y todo tu historial permanentemente (salvo retenciones legales imperativas).</li>
          <li><strong>Derecho de Limitación y Oposición:</strong> Bloquear usos concretos de tus datos (ej. procesamiento estadístico o perfilado).</li>
          <li><strong>Derecho a la Portabilidad:</strong> Recibir tus recetas y datos en un formato informático estructurado (JSON, CSV).</li>
        </ul>
        <p className="mb-4">
          Si consideras que no hemos tratado tu solicitud adecuadamente, tienes derecho a presentar una reclamación ante la autoridad de control pertinente, en el caso de España, la Agencia Española de Protección de Datos (AEPD).
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">7. Política de Cookies Simplificada</h2>
        <p className="mb-4">
          MisArroces emplea un número muy reducido de Cookies (archivos de texto guardados en tu navegador). Solo utilizamos:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Cookies Estrictamente Necesarias (Técnicas):</strong> Tokens de autenticación JWT (Json Web Tokens) para mantener tu sesión activa y asegurar las peticiones al servidor. No requieren consentimiento expreso por ser vitales para el servicio.</li>
          <li>Actualmente <strong>NO</strong> utilizamos cookies de publicidad comportamental de terceros, píxeles de rastreo invasivos ni sistemas de retargeting publicitario.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">8. Medidas de Seguridad Aplicadas</h2>
        <p className="mb-4">
          Hemos implementado robustas barreras arquitectónicas (Security-by-Design):
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Uso exclusivo de protocolos cifrados HTTPS (TLS 1.3).</li>
          <li>Row Level Security (RLS) en la base de datos, garantizando que un usuario no puede leer bases de datos privadas ni mensajes directos de otro.</li>
          <li>Almacenamiento seguro y segregado (Storage Buckets con controles estrictos MIME/Size).</li>
        </ul>

        <p className="text-sm mt-12 pt-8 border-t border-border">
          Versión: 2.0<br/>
          Última actualización: Agosto de 2026
        </p>
      </div>
    </div>
  )
}
`;

fs.writeFileSync('src/app/legal/privacy/page.tsx', privacyContent);
console.log("UPDATED PRIVACY - EXPANDED");

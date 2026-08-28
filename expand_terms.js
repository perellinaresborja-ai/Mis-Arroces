const fs = require('fs');

const termsContent = `import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 pt-16 min-h-screen">
      <Link href="/" className="text-primary hover:underline mb-8 inline-block font-medium">
        &larr; Volver a inicio
      </Link>
      
      <h1 className="text-4xl font-bold font-serif mb-8 text-foreground">Condiciones Generales de Uso</h1>
      
      <div className="prose prose-stone max-w-none text-muted-foreground">
        <p className="lead text-lg mb-8">
          Te damos la bienvenida a MisArroces. El presente documento establece las Condiciones Generales de Uso (en adelante, las "Condiciones") que regulan el acceso, navegación y uso de la plataforma web y aplicación móvil de MisArroces (en adelante, "la Plataforma" o "el Servicio").
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Información General y Objeto</h2>
        <p className="mb-4">
          MisArroces es una red social y comunidad gastronómica especializada y orientada a la divulgación, aprendizaje e interacción sobre la cocción de arroces. La Plataforma permite a los Usuarios crear, compartir, visualizar recetas, elaborar sesiones de cocinado ("Cookings"), publicar historias temporales y enviarse mensajes directos.
        </p>
        <p className="mb-4">
          El acceso a la Plataforma implica la aceptación expresa y sin reservas de todas las disposiciones incluidas en estas Condiciones Generales de Uso, las cuales tienen la misma validez y eficacia que cualquier contrato celebrado por escrito y firmado. Si no estás de acuerdo con estas Condiciones, te rogamos que no utilices la Plataforma.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Requisitos de Acceso y Registro</h2>
        <p className="mb-4">
          <strong>2.1. Edad mínima:</strong> El registro en MisArroces está terminantemente prohibido para menores de catorce (14) años. Al registrarte, garantizas que tienes al menos 14 años de edad. En caso de ser menor de 18 años pero mayor de 14, garantizas contar con el consentimiento de tus padres o tutores legales. MisArroces se reserva el derecho de solicitar en cualquier momento una prueba de edad.
        </p>
        <p className="mb-4">
          <strong>2.2. Veracidad de los datos:</strong> Al crear una cuenta, te comprometes a proporcionar información veraz, exacta y actualizada. Es tu responsabilidad mantener estos datos actualizados en el panel de configuración de tu perfil.
        </p>
        <p className="mb-4">
          <strong>2.3. Seguridad de la cuenta:</strong> Eres el único responsable de salvaguardar tu contraseña y de toda la actividad que ocurra bajo tu cuenta. En caso de detectar cualquier uso no autorizado, vulnerabilidad o brecha de seguridad en tu cuenta, debes notificarlo de forma inmediata a los administradores de MisArroces.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Propiedad Intelectual y Licencias</h2>
        <p className="mb-4">
          <strong>3.1. Derechos de MisArroces:</strong> Todos los derechos de propiedad intelectual e industrial sobre el software, código fuente, algoritmos, diseño, interfaces, estructura de navegación, bases de datos, marcas y logotipos de la Plataforma son titularidad exclusiva de MisArroces o de sus respectivos licenciantes, estando protegidos por las leyes nacionales e internacionales.
        </p>
        <p className="mb-4">
          <strong>3.2. Contenido Generado por el Usuario (UGC):</strong> Tú mantienes en todo momento la propiedad y los derechos de autor (copyright) sobre cualquier contenido que subas, publiques o envíes a la Plataforma (fotografías, textos, vídeos, recetas y comentarios). 
        </p>
        <p className="mb-4">
          <strong>3.3. Licencia a favor de MisArroces:</strong> Para que el Servicio pueda funcionar, al publicar contenido nos otorgas una licencia mundial, no exclusiva, gratuita, sublicenciable y transferible para alojar, usar, distribuir, modificar, ejecutar, copiar, reproducir, mostrar o comunicar públicamente y traducir dicho contenido. Esta licencia se otorga con el único fin de proveer, mejorar, promocionar y proteger los Servicios de la Plataforma. Dicha licencia finalizará en el momento en que elimines tu contenido o tu cuenta, salvo en la medida en que tu contenido haya sido compartido por otros y estos no lo hayan eliminado, o bien cuando la retención del mismo sea estrictamente necesaria por imperativo legal.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Normas de Conducta y Uso Aceptable (DSA)</h2>
        <p className="mb-4">
          Como usuario de MisArroces, te comprometes a hacer un uso adecuado, ético y legal de la Plataforma. Está estrictamente prohibido y será motivo de suspensión inmediata y permanente de la cuenta:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Contenido Ilegal:</strong> Publicar o compartir contenido que constituya un delito, fomente la violencia, el terrorismo, la explotación infantil, o incite al odio, la discriminación y la intolerancia por razones de raza, religión, género, orientación sexual o discapacidad.</li>
          <li><strong>Propiedad Intelectual de Terceros:</strong> Subir material fotográfico, audiovisual o textos (recetas extraídas íntegramente de libros con copyright) sin el consentimiento explícito de sus legítimos autores.</li>
          <li><strong>Acoso y Abuso (Bullying):</strong> Utilizar comentarios, mensajes directos (DMs) o cualquier otra vía para hostigar, insultar, amenazar o doxxear a otros usuarios de la comunidad.</li>
          <li><strong>Spam y Fraude:</strong> Utilizar la plataforma para el envío masivo de publicidad no solicitada, estafas, esquemas piramidales o suplantación de identidad (Phishing).</li>
          <li><strong>Manipulación Técnica:</strong> Intentar alterar, eludir o hackear las medidas de seguridad de la Plataforma. Usar bots, web scrapers o automatizaciones para extraer masivamente datos o interactuar artificialmente (ej. compra de seguidores o likes).</li>
        </ul>
        <p className="mb-4">
          <strong>Ley de Servicios Digitales (DSA):</strong> MisArroces opera estrictamente como prestador de servicios de alojamiento de datos. No revisamos proactivamente la totalidad del contenido publicado por los usuarios antes de su publicación. No obstante, en caso de recibir una denuncia válida, un requerimiento judicial o tener conocimiento efectivo de la existencia de contenido ilícito, procederemos a su inmediata retirada o bloqueo, colaborando con las autoridades competentes.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Mecanismos de Reporte y Retirada (Notice and Takedown)</h2>
        <p className="mb-4">
          Cualquier usuario o tercero que considere que un contenido vulnera la legalidad, sus derechos de propiedad intelectual o estas Condiciones, puede utilizar el botón de "Reportar" integrado en todas las publicaciones y perfiles, o bien ponerse en contacto a través de nuestro correo legal. Revisaremos el reporte a la mayor brevedad y tomaremos las medidas correctivas oportunas.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">6. Cuentas Profesionales y Uso Comercial</h2>
        <p className="mb-4">
          Si te registras o utilizas la Plataforma en representación de una empresa, restaurante o entidad mercantil, declaras tener la autoridad legal suficiente para vincular a dicha entidad a estas Condiciones. Cualquier promoción, concurso, sorteo o campaña de marketing que decidas llevar a cabo dentro de la Plataforma será bajo tu absoluta responsabilidad, debiendo cumplir de forma independiente con la legislación en materia de consumo, sorteos y fiscalidad que corresponda.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">7. Modificaciones en el Servicio</h2>
        <p className="mb-4">
          Dado que MisArroces es una plataforma en constante evolución, nos reservamos el derecho a realizar en cualquier momento y sin necesidad de previo aviso cuantas modificaciones, supresiones o actualizaciones visuales y técnicas estimemos oportunas para mejorar el servicio. Esto puede incluir límites de almacenamiento o la eliminación de funciones obsoletas.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">8. Exclusión y Limitación de Responsabilidad</h2>
        <p className="mb-4">
          <strong>8.1. Fiabilidad de las Recetas:</strong> La comunidad comparte recetas de forma libre. MisArroces no verifica ni se hace responsable de la exactitud, salubridad o seguridad de las recetas, tiempos de cocción, temperaturas o manipulación de ingredientes. La aplicación de cualquier consejo gastronómico corre exclusivamente por tu cuenta y riesgo. Es tu deber verificar las intolerancias y alergias (ej. intolerancia al gluten, alergia al marisco).
        </p>
        <p className="mb-4">
          <strong>8.2. Funcionamiento de la Red:</strong> MisArroces no garantiza que el acceso a la Plataforma sea ininterrumpido o esté libre de errores en todo momento. No asumimos responsabilidad por caídas de servidores (propios o de terceros), problemas de conectividad, pérdida fortuita de datos de usuario (se recomienda realizar copias de las recetas localmente), o daños producidos en dispositivos derivados de acciones de terceros (virus, malware).
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">9. Enlaces de Terceros</h2>
        <p className="mb-4">
          La Plataforma puede contener enlaces a sitios web o recursos de terceros (por ejemplo, enlaces de afiliación o tiendas para la compra de utensilios o ingredientes). MisArroces no tiene control alguno sobre el contenido, políticas de privacidad o prácticas de dichos sitios externos y, en consecuencia, no asume ninguna responsabilidad derivada de su uso.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">10. Duración, Terminación y Suspensión</h2>
        <p className="mb-4">
          El presente acuerdo tiene duración indefinida mientras utilices la Plataforma. Puedes resolverlo en cualquier momento eliminando tu cuenta a través de los ajustes de configuración. MisArroces podrá suspender, limitar o cancelar de forma unilateral tu acceso al Servicio y eliminar tu cuenta, de forma temporal o permanente, en caso de incumplimiento de cualquiera de las obligaciones establecidas en estas Condiciones de Uso, sin perjuicio de la reclamación de daños y perjuicios que pudiera corresponder.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">11. Ley Aplicable y Jurisdicción (Resolución de Disputas)</h2>
        <p className="mb-4">
          Estas Condiciones, así como cualquier relación entre tú como Usuario y MisArroces, se regirán e interpretarán de acuerdo con la legislación común de España. 
        </p>
        <p className="mb-4">
          En caso de controversia, de acuerdo con la legislación de defensa de los consumidores, te asiste el derecho a someter el conflicto a los juzgados y tribunales del domicilio en el que residas. Adicionalmente, la Comisión Europea facilita una plataforma de resolución de litigios en línea, disponible en el enlace: <a href="https://ec.europa.eu/consumers/odr" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>. Para entidades jurídicas o profesionales, las partes se someterán expresamente a la jurisdicción de los tribunales de la ciudad de Madrid (España).
        </p>

        <p className="text-sm mt-12 pt-8 border-t border-border">
          Versión: 2.0<br/>
          Última actualización: Agosto de 2026
        </p>
      </div>
    </div>
  )
}
`;

fs.writeFileSync('src/app/legal/terms/page.tsx', termsContent);
console.log("UPDATED TERMS - EXPANDED");

import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Normas de la Comunidad | misarroces",
  description: "Normas y principios de convivencia, seguridad y respeto en misarroces.",
}

export default function NormasComunidadPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 pt-16 min-h-screen">
      <Link href="/" className="text-primary hover:underline mb-8 inline-block font-medium">
        &larr; Volver a inicio
      </Link>
      
      <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">Normas de la Comunidad</h1>
      
      <div className="prose prose-zinc dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
        <p className="text-lg font-medium text-foreground mb-4">
          misarroces es una comunidad para compartir recetas, arroces, conocimiento, experiencias y conectar con otras personas. Queremos que cualquiera pueda participar, aprender y compartir con seguridad y respeto.
        </p>

        <p className="mb-8">
          Estas normas se aplican a perfiles, nombres de usuario, publicaciones, recetas, comentarios, Stories, vídeos, mensajes, imágenes, enlaces y cualquier otra función de misarroces.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Respeta a los demás</h2>
        <p className="mb-4">
          No permitimos acoso, amenazas, intimidación, humillación deliberada ni hostigamiento. Tampoco contenido que promueva odio, violencia o discriminación contra personas o colectivos. Las críticas y desacuerdos están permitidos; los ataques personales y el acoso, no.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Amenazas y violencia</h2>
        <p className="mb-4">
          No se permiten amenazas creíbles, incitación a la violencia, glorificación de actos violentos graves ni contenido extremadamente violento destinado principalmente a impactar o intimidar.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Protección de menores</h2>
        <p className="mb-4">
          Tolerancia cero con cualquier contenido relacionado con explotación, abuso o sexualización de menores. Podemos eliminarlo inmediatamente, suspender permanentemente cuentas y comunicar los hechos a las autoridades cuando corresponda.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Contenido sexual</h2>
        <p className="mb-4">
          No permitimos pornografía, actos sexuales explícitos, solicitud de servicios sexuales ni contenido destinado principalmente a provocar excitación sexual. Podrán existir excepciones justificadas por contexto educativo, cultural o documental.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Privacidad</h2>
        <p className="mb-4">
          No publiques información privada de otras personas sin autorización, incluyendo direcciones particulares, teléfonos, documentos de identidad, datos bancarios, contraseñas u otra información que pueda ponerlas en riesgo. Tampoco se permiten amenazas de publicar dicha información.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">6. Suplantación de identidad</h2>
        <p className="mb-4">
          No está permitido hacerse pasar deliberadamente por otra persona, chef, restaurante, empresa, organización o entidad. Las cuentas de parodia deberán dejar claro que no representan a la persona o entidad original.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">7. Contenido propio y propiedad intelectual</h2>
        <p className="mb-4">
          Publica contenido creado por ti o que tengas derecho a utilizar. No está permitido apropiarse deliberadamente de fotografías, vídeos, textos, recetas u otras obras de terceros presentándolas como propias. Respeta la autoría y los derechos de terceros.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">8. Recetas y contenido gastronómico</h2>
        <p className="mb-4">
          Se pueden compartir recetas tradicionales, versiones personales, reinterpretaciones y técnicas culinarias. Que dos recetas sean similares no implica por sí mismo una infracción. No permitimos copiar sistemáticamente contenido ajeno protegido y presentarlo como creación propia.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">9. Spam y manipulación</h2>
        <p className="mb-4">
          No permitimos spam, mensajes repetitivos masivos, seguidores o interacciones artificiales, cuentas destinadas a manipular métricas, automatizaciones abusivas, phishing, malware, estafas, enlaces engañosos ni manipulación artificial de la plataforma.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">10. Fraude y actividades ilegales</h2>
        <p className="mb-4">
          No utilices misarroces para organizar, promover, vender o facilitar actividades ilegales, estafas, falsificaciones, fraude o prácticas comerciales deliberadamente engañosas.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">11. Productos y actividades reguladas</h2>
        <p className="mb-4">
          Puede existir contenido sobre alcohol u otros productos regulados dentro de un contexto gastronómico legítimo. No se permitirá utilizar misarroces para facilitar actividades ilegales ni la venta ilícita de sustancias, armas u otros productos prohibidos.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">12. Información peligrosa o engañosa</h2>
        <p className="mb-4">
          No publiques deliberadamente información falsa que pueda causar un daño significativo. Prestaremos especial atención a información relacionada con seguridad alimentaria, alergias, intoxicaciones o salud. Las opiniones culinarias, técnicas diferentes o discusiones sobre recetas no constituyen por sí mismas desinformación.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">13. Autolesiones y conductas peligrosas</h2>
        <p className="mb-4">
          No permitimos contenido que promueva, anime o instruya sobre autolesiones, suicidio u otras conductas gravemente peligrosas. El contenido informativo, preventivo o destinado a buscar ayuda podrá tratarse de forma diferente según su contexto.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">14. Sorteos y promociones</h2>
        <p className="mb-4">
          Los sorteos y promociones realizados en misarroces deberán ser reales, transparentes y cumplir la legislación aplicable. No se podrán manipular participantes, condiciones, ganadores o resultados. misarroces podrá establecer reglas adicionales para sus herramientas propias de sorteos y promociones.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">15. Profesionales, empresas y publicidad</h2>
        <p className="mb-4">
          Restaurantes, marcas, productores, cocineros y otros profesionales pueden participar en misarroces. El contenido comercial deberá respetar estas normas y no podrá utilizar técnicas engañosas, spam o suplantación. Cuando corresponda, el contenido publicitario o patrocinado deberá identificarse adecuadamente.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">16. Denuncias</h2>
        <p className="mb-4">
          Los usuarios podrán denunciar contenido o comportamientos que consideren contrarios a estas normas. Una denuncia no implica automáticamente que exista una infracción. misarroces podrá revisar el contenido, su contexto y el comportamiento asociado antes de tomar una decisión.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">17. Medidas ante infracciones</h2>
        <p className="mb-2">
          Dependiendo de la gravedad, contexto y reincidencia, misarroces podrá:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>eliminar contenido;</li>
          <li>limitar su difusión;</li>
          <li>restringir temporalmente determinadas funciones;</li>
          <li>advertir al usuario;</li>
          <li>suspender temporalmente una cuenta;</li>
          <li>suspender permanentemente una cuenta.</li>
        </ul>
        <p className="mb-4">
          Las infracciones especialmente graves podrán provocar una suspensión inmediata.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">18. Evasión de sanciones</h2>
        <p className="mb-4">
          No está permitido crear o utilizar otras cuentas para evitar restricciones o suspensiones. Las cuentas utilizadas para eludir una sanción también podrán ser restringidas o suspendidas.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">19. Revisión de decisiones</h2>
        <p className="mb-4">
          Cuando exista un mecanismo de revisión disponible, el usuario podrá solicitar que volvamos a revisar una decisión relacionada con su contenido o cuenta.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">20. Actualización de las normas</h2>
        <p className="mb-4">
          misarroces seguirá evolucionando y podrá actualizar estas normas para adaptarlas a nuevas funciones, riesgos, obligaciones legales o necesidades de la comunidad.
        </p>

        <div className="mt-8 p-6 bg-card border border-border rounded-2xl">
          <p className="text-foreground font-medium">
            El uso de misarroces implica respetar estas Normas de la Comunidad, además de los{" "}
            <Link href="/legal/terms" className="text-primary hover:underline font-semibold">
              Términos y Condiciones
            </Link>{" "}
            y la{" "}
            <Link href="/legal/privacy" className="text-primary hover:underline font-semibold">
              Política de Privacidad
            </Link>.
          </p>
        </div>

        <p className="text-sm mt-12 pt-8 border-t border-border">
          Última actualización: Septiembre de 2026
        </p>
      </div>
    </div>
  )
}

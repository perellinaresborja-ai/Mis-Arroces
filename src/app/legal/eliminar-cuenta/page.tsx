import Link from "next/link"
import DeleteAccountClientForm from "./DeleteAccountClientForm"

export const metadata = {
  title: "Eliminación de Cuenta y Datos | misarroces",
  description: "Información y solicitud para la eliminación de tu cuenta y datos personales asociados en misarroces.",
}

export default function DeleteAccountRequestPage() {
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 pt-10 sm:pt-16 min-h-screen">
      <Link 
        href="/" 
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mb-6"
      >
        <span aria-hidden="true">&larr;</span>
        <span>Volver a misarroces</span>
      </Link>

      <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
            Gestión de Datos Personales
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Eliminación de Cuenta y Datos
          </h1>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            En <strong>misarroces</strong> (Celler Naziha S.L.) garantizamos el derecho a la supresión de datos conforme al Reglamento General de Protección de Datos (RGPD) y a las directrices de Google Play. Puedes gestionar la eliminación de tu cuenta desde los Ajustes de la aplicación o solicitarla a través de esta página web si ya la has desinstalado.
          </p>
        </div>

        {/* MÉTODO 1: DESDE LA APLICACIÓN / AJUSTES */}
        <div className="p-5 sm:p-6 rounded-2xl bg-muted/30 border border-border space-y-3">
          <h2 className="text-lg font-bold text-foreground">
            Opción 1: Eliminación directa desde los Ajustes de la cuenta
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Si todavía tienes la aplicación instalada o la sesión iniciada en la web, puedes tramitar la baja directamente desde tu panel de usuario:
          </p>
          <ol className="list-decimal list-inside text-sm text-foreground/90 space-y-1.5 pl-1 font-medium">
            <li>Inicia sesión con tu cuenta en <strong>misarroces</strong>.</li>
            <li>Entra en <Link href="/settings" className="text-primary font-bold underline">Ajustes / Configuración</Link>.</li>
            <li>Desplázate hasta la sección inferior y pulsa en el botón rojo <strong>"Eliminar cuenta"</strong>.</li>
            <li>Escribe <span className="font-mono font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">ELIMINAR</span> para confirmar la acción.</li>
          </ol>
          <p className="text-xs text-muted-foreground pt-1">
            Al confirmar, el sistema cierra tu sesión y procede a la eliminación definitiva de tu cuenta y datos asociados.
          </p>
          <div className="pt-2">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground border border-border transition"
            >
              <span>Abrir Ajustes de cuenta</span>
            </Link>
          </div>
        </div>

        {/* MÉTODO 2: FORMULARIO WEB (SI YA NO TIENES LA APP) */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">
            Opción 2: Solicitud web (si has desinstalado la app)
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Si has desinstalado la aplicación móvil o no recuerdas tu contraseña, introduce la dirección de correo asociada a tu cuenta. Te remitiremos un código de verificación para validar que eres el titular y proceder con la eliminación definitiva sin exponer tu privacidad.
          </p>
          
          <DeleteAccountClientForm />
        </div>

        {/* ¿QUÉ DATOS SE ELIMINAN? */}
        <div className="space-y-4 pt-2">
          <h2 className="text-lg font-bold text-foreground">
            Datos que se eliminan
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
              <h3 className="font-bold text-sm text-foreground text-red-600 dark:text-red-400">
                Se eliminan de forma permanente:
              </h3>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>Perfil completo de usuario (nombre, @usuario, biografía y avatar).</li>
                <li>Identificador único de usuario y credenciales de acceso.</li>
                <li>Archivos multimedia propios subidos al almacenamiento (fotos de perfil, historias y adjuntos de mensajes).</li>
                <li>Mensajes directos enviados y conversaciones privadas.</li>
                <li>Interacciones sociales (comentarios, me gustas, recetas guardadas y seguidores).</li>
                <li>Preferencias de usuario y registros de consentimiento.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
              <h3 className="font-bold text-sm text-foreground">
                Recetas comunitarias compartidas:
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Para no romper el recetario comunitario ni perjudicar a los miembros que hayan guardado preparaciones públicas, las recetas creadas permanecen de forma anónima, desvinculadas de cualquier identificador personal. El usuario pierde cualquier acceso o vinculación con ellas.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                Una vez completado el borrado, la acción es irreversible y la cuenta no puede ser recuperada.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>Responsable: Celler Naziha S.L. · NIF B54936604 · info@misarroces.es</span>
          <Link href="/legal/privacy" className="text-primary hover:underline font-semibold">
            Ver Política de Privacidad completa
          </Link>
        </div>
      </div>
    </div>
  )
}

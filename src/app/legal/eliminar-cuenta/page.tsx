import Link from "next/link"
import { Trash2, ShieldAlert, ArrowLeft, CheckCircle2, SlidersHorizontal } from "lucide-react"
import DeleteAccountClientForm from "./DeleteAccountClientForm"

export const metadata = {
  title: "Eliminación de Cuenta y Datos | misarroces",
  description: "Información y solicitud para la eliminación de tu cuenta y todos tus datos personales asociados en misarroces.",
}

export default function DeleteAccountRequestPage() {
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 pt-10 sm:pt-16 min-h-screen">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a misarroces</span>
      </Link>

      <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Gestión de Datos Personales</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Eliminación de Cuenta y Datos
          </h1>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            En <strong>misarroces</strong> (Celler Naziha S.L.) garantizamos el derecho a la supresión de datos conforme al Reglamento General de Protección de Datos (RGPD) y a las directrices de seguridad de Google Play. Puedes eliminar tu cuenta de forma instantánea si dispones de la app o solicitarla a través de esta web si ya la has desinstalado.
          </p>
        </div>

        {/* MÉTODO 1: DESDE LA APLICACIÓN / AJUSTES (INSTANTÁNEO) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-muted/30 border border-border space-y-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2 className="text-lg font-bold text-foreground">
              Opción 1: Eliminación directa desde Ajustes (Inmediata)
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Si todavía tienes la aplicación instalada o la sesión iniciada en la web, el método más rápido es gestionarlo directamente desde tu panel de usuario:
          </p>
          <ol className="list-decimal list-inside text-sm text-foreground/90 space-y-1.5 pl-1 font-medium">
            <li>Inicia sesión con tu cuenta en <strong>misarroces</strong>.</li>
            <li>Entra en <Link href="/settings" className="text-primary font-bold underline">Ajustes / Configuración</Link>.</li>
            <li>Desplázate hasta la sección inferior y pulsa en el botón rojo <strong>"Eliminar cuenta"</strong>.</li>
            <li>Escribe <span className="font-mono font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">ELIMINAR</span> para confirmar la acción.</li>
          </ol>
          <div className="pt-2">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground border border-border transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
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
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-zinc-500" />
            <span>Datos que se eliminan y política de retención</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
              <h3 className="font-bold text-sm text-foreground text-red-600 dark:text-red-400">
                Se eliminan de forma permanente:
              </h3>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>Perfil completo (nombre, @usuario, biografía y avatar).</li>
                <li>Identificador único de usuario y credenciales de acceso.</li>
                <li>Fotografías y vídeos originales subidos al Storage.</li>
                <li>Mensajes directos enviados y archivos adjuntos.</li>
                <li>Reacciones ("me gusta"), comentarios y listas de compra.</li>
                <li>Historial de cocinados y notas privadas de recetas.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
              <h3 className="font-bold text-sm text-foreground">
                Datos retenidos por motivos legales:
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Únicamente se conservarán registros técnicos mínimos de conexión (logs anonimizados) durante los plazos estrictamente exigidos por la legislación española para prevención de fraudes o requerimientos judiciales. Ningún dato personal volverá a ser accesible ni utilizado con fines comerciales.
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

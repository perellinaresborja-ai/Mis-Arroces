import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, User, Shield, Moon, Bell, Calculator, ShoppingCart, UtensilsCrossed, BookOpen, Bookmark, ShieldAlert, Info, LogOut, SearchX, MicOff } from "lucide-react"
import { PrivacyToggle } from "./components/PrivacyToggle"
import { signOutAction } from "@/app/actions/logout"
import ThemeSelectorRow from "./components/ThemeSelectorRow"
import DeleteAccountRow from "./components/DeleteAccountRow"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect("/auth")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect("/auth")
  }

  const isPrivate = profile.privacy_level === "PRIVATE"

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <header className="flex items-center gap-4 mb-8">
          <Link href={`/@${profile.username}`} className="p-2 -ml-2 rounded-full hover:bg-muted transition">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold">Configuración</h1>
        </header>

        <div className="space-y-10">
          
          {/* CUENTA */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Cuenta</h3>
            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
              <Link href="/profile/edit" className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
                <div className="flex items-center gap-3"><User className="w-5 h-5 text-muted-foreground" /> <span className="font-medium">Editar perfil</span></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <div className="h-px bg-border ml-12"></div>
              <Link href="/profile/requests" className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
                <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-muted-foreground" /> <span className="font-medium">Solicitudes de seguimiento</span></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </section>

          {/* APARIENCIA */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Apariencia</h3>
            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
              <ThemeSelectorRow />
            </div>
          </section>

          {/* PRIVACIDAD */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Privacidad</h3>
            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
              <PrivacyToggle initialIsPrivate={isPrivate} userId={user.id} />
              <div className="h-px bg-border ml-12"></div>
              <Link href="/settings/privacy/blocked" className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
                <div className="flex items-center gap-3"><ShieldAlert className="w-5 h-5 text-muted-foreground" /> <span className="font-medium">Usuarios bloqueados</span></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </section>

          {/* INTERACCIONES */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Interacciones</h3>
            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
              <Link href="/settings/interactions/muted" className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
                <div className="flex items-center gap-3"><MicOff className="w-5 h-5 text-muted-foreground" /> <span className="font-medium">Cuentas silenciadas</span></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <div className="h-px bg-border ml-12"></div>
              <Link href="/settings/interactions/words" className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
                <div className="flex items-center gap-3"><SearchX className="w-5 h-5 text-muted-foreground" /> <span className="font-medium">Palabras ocultas</span></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </section>

          {/* NOTIFICACIONES */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Notificaciones</h3>
            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
              <Link href="/settings/notifications" className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
                <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-muted-foreground" /> <span className="font-medium">Notificaciones</span></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </section>

          {/* HERRAMIENTAS */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Herramientas</h3>
            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
              <Link href="/calculadora-capa" className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
                <div className="flex items-center gap-3"><Calculator className="w-5 h-5 text-muted-foreground" /> <span className="font-medium">Calculadora de Capa</span></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <div className="h-px bg-border ml-12"></div>
              <Link href="/shopping-list" className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
                <div className="flex items-center gap-3"><ShoppingCart className="w-5 h-5 text-muted-foreground" /> <span className="font-medium">Lista de compra</span></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </section>

          {/* MI CONTENIDO */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Mi Contenido</h3>
            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
              <Link href="/cookbook?tab=cooked" className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
                <div className="flex items-center gap-3"><UtensilsCrossed className="w-5 h-5 text-muted-foreground" /> <span className="font-medium">Mis Arroces</span></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <div className="h-px bg-border ml-12"></div>
              <Link href="/cookbook?tab=mine" className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
                <div className="flex items-center gap-3"><BookOpen className="w-5 h-5 text-muted-foreground" /> <span className="font-medium">Mis Recetas</span></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <div className="h-px bg-border ml-12"></div>
              <Link href="/cookbook?tab=saved" className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
                <div className="flex items-center gap-3"><Bookmark className="w-5 h-5 text-muted-foreground" /> <span className="font-medium">Guardados</span></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </section>

          {/* SEGURIDAD Y DATOS */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Seguridad y Datos</h3>
            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
              <Link href="/update-password" className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
                <div className="flex items-center gap-3"><ShieldAlert className="w-5 h-5 text-muted-foreground" /> <span className="font-medium">Cambiar contraseña</span></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <div className="h-px bg-border ml-12"></div>
              <DeleteAccountRow userId={user.id} />
            </div>
          </section>

          {/* AYUDA E INFORMACIÓN */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-4">Ayuda e Información</h3>
            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
              <a href="mailto:hola@misarroces.es" className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
                <div className="flex items-center gap-3"><Info className="w-5 h-5 text-muted-foreground" /> <span className="font-medium">Contacto / Reportar problema</span></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </a>
              <div className="h-px bg-border ml-12"></div>
              <Link href="/legal/privacy" className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
                <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-muted-foreground" /> <span className="font-medium">Política de privacidad</span></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <div className="h-px bg-border ml-12"></div>
              <Link href="/legal/terms" className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
                <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-muted-foreground" /> <span className="font-medium">Términos de servicio</span></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </section>

          <div className="pt-6 pb-8">
            <form action={signOutAction}>
              <button className="w-full py-4 text-red-500 font-bold hover:bg-red-50/10 hover:text-red-400 transition-colors rounded-3xl flex items-center justify-center gap-2" type="submit">
                <LogOut className="w-5 h-5" /> Cerrar Sesión
              </button>
            </form>
            <div className="text-center mt-8">
              <span className="text-xs text-muted-foreground font-medium">Mis Arroces v1.0</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}




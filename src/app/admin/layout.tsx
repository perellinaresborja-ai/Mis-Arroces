import { ReactNode } from "react"
import Link from "next/link"
import { requireAdminSession } from "@/lib/admin/auth"
import { AdminNav, AdminMobileNav } from "./components/AdminNav"
import { ShieldCheck, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Mi Admin | misarroces",
  description: "Panel de administración privado de misarroces",
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Guardián estricto: si no es admin, lanza 404 instantáneamente
  const session = await requireAdminSession()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-black text-xl tracking-tight text-primary hover:opacity-90 transition">
              misarroces
            </Link>
            <span className="text-muted-foreground/40 font-mono">/</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight">Mi Admin</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <ShieldCheck className="w-3 h-3" />
                {session.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-xs">
              <span className="font-semibold text-foreground">
                {session.profile.display_name || session.profile.username}
              </span>
              <span className="text-muted-foreground font-mono text-[10px]">@{session.profile.username}</span>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-full transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la app</span>
            </Link>
          </div>
        </div>

        {/* Mobile Horizontal Navigation */}
        <div className="md:hidden border-t border-border/50 px-2 py-1">
          <AdminMobileNav />
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24 bg-card border border-border rounded-3xl p-3 shadow-sm">
            <div className="px-3 py-2 mb-2 border-b border-border/50">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Panel de Control
              </p>
            </div>
            <AdminNav />
          </div>
        </aside>

        {/* Dynamic Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}

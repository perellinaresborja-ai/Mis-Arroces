import Link from "next/link";
import { BookOpen, Utensils, Clapperboard, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function UniversalCreatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-md mx-auto p-4 pt-12 pb-safe min-h-[calc(100vh-4rem)] flex flex-col justify-center animate-in fade-in zoom-in-95 duration-200">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-serif mb-2 text-foreground">Crear</h1>
        <p className="text-muted-foreground">¿Qué te gustaría compartir hoy?</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Receta */}
        <Link href="/create/recipe" className="group flex items-center gap-4 bg-card border border-border p-5 rounded-3xl hover:border-primary/50 hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0 group-hover:scale-110 transition-transform">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-lg font-bold text-foreground">Nueva Receta</h2>
            <p className="text-sm text-muted-foreground">Comparte tus arroces paso a paso</p>
          </div>
        </Link>

        {/* Elaboración (Session) */}
        <Link href="/create/session" className="group flex items-center gap-4 bg-card border border-border p-5 rounded-3xl hover:border-primary/50 hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 transition-transform">
            <Utensils className="w-7 h-7" />
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-lg font-bold text-foreground">Cocinar Receta</h2>
            <p className="text-sm text-muted-foreground">Registra un cocinado (sólo o de otra receta)</p>
          </div>
        </Link>

        {/* Story */}
        <Link href="/create/story" className="group flex items-center gap-4 bg-card border border-border p-5 rounded-3xl hover:border-primary/50 hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 shrink-0 group-hover:scale-110 transition-transform">
            <Clapperboard className="w-7 h-7" />
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-lg font-bold text-foreground">Subir Historia</h2>
            <p className="text-sm text-muted-foreground">Foto o vídeo efímero (24h)</p>
          </div>
        </Link>

        {/* Post */}
        <Link href="/create/post" className="group flex items-center gap-4 bg-card border border-border p-5 rounded-3xl hover:border-primary/50 hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-lg font-bold text-foreground">Publicar en Feed</h2>
            <p className="text-sm text-muted-foreground">Comparte un consejo, pregunta o foto</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

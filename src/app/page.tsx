import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm w-full gap-8">
        
        {/* Logo Placeholder */}
        <div className="relative w-48 h-48 rounded-full border-2 border-primary/20 bg-background flex items-center justify-center shadow-sm">
          <div className="text-4xl font-bold tracking-tighter text-foreground">
            mis<span className="text-primary">arroces</span>
          </div>
        </div>
        
        {/* Core Proposition */}
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            El arroz es el héroe.
          </h1>
          <p className="text-muted-foreground text-base">
            Tu recetario de arroz, siempre contigo. Guarda tus resultados, mejora tus técnicas y nunca olvides cómo hiciste esa paella perfecta.
          </p>
        </div>
        
        {/* Call to Action */}
        <div className="w-full space-y-4 pt-4">
          <Link 
            href="/cookbook" 
            className={cn(buttonVariants({ size: "lg" }), "w-full text-base h-14 rounded-xl")}
          >
            Entrar a mi recetario
          </Link>
          <Link 
            href="/discover" 
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full text-base h-14 rounded-xl border-border")}
          >
            Explorar comunidad
          </Link>
        </div>
        
      </div>
    </div>
  );
}

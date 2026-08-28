import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto p-8 pt-16 min-h-screen">
      <Link href="/" className="text-primary hover:underline mb-8 inline-block font-medium">
        &larr; Volver a inicio
      </Link>
      
      <h1 className="text-4xl font-bold font-serif mb-8 text-charcoal">Condiciones de Uso</h1>
      
      <div className="prose prose-stone max-w-none">
        <p className="lead text-lg text-muted-foreground mb-8">
          Bienvenido a MisArroces. Al utilizar nuestra plataforma, aceptas estas condiciones de uso.
        </p>
        
        <div className="bg-muted/50 p-6 rounded-2xl border border-border mb-8">
          <p className="text-sm">
            <strong>Nota:</strong> Este es un documento provisional en fase de desarrollo. El texto legal definitivo será añadido próximamente.
          </p>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">1. Aceptación de los términos</h2>
        <p className="mb-4">
          Al acceder y utilizar MisArroces, aceptas estar sujeto a estas Condiciones de Uso y a todas las leyes y regulaciones aplicables.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. Uso de la plataforma</h2>
        <p className="mb-4">
          MisArroces es una comunidad para compartir y descubrir recetas de arroz. Te comprometes a usar la plataforma de manera respetuosa y a no publicar contenido ofensivo, ilegal o que infrinja derechos de terceros.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. Contenido del usuario</h2>
        <p className="mb-4">
          Mantienes todos los derechos sobre el contenido que publicas. Sin embargo, nos concedes una licencia no exclusiva para mostrar y distribuir tu contenido dentro de la plataforma MisArroces.
        </p>

      </div>
    </div>
  )
}

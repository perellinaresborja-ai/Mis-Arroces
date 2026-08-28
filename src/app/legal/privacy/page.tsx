import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto p-8 pt-16 min-h-screen">
      <Link href="/" className="text-primary hover:underline mb-8 inline-block font-medium">
        &larr; Volver a inicio
      </Link>
      
      <h1 className="text-4xl font-bold font-serif mb-8 text-charcoal">Política de Privacidad</h1>
      
      <div className="prose prose-stone max-w-none">
        <p className="lead text-lg text-muted-foreground mb-8">
          Tu privacidad es importante para nosotros. Esta política explica cómo recopilamos, usamos y protegemos tus datos en MisArroces.
        </p>
        
        <div className="bg-muted/50 p-6 rounded-2xl border border-border mb-8">
          <p className="text-sm">
            <strong>Nota:</strong> Este es un documento provisional en fase de desarrollo. El texto legal definitivo será añadido próximamente.
          </p>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">1. Información que recopilamos</h2>
        <p className="mb-4">
          Recopilamos la información que nos proporcionas directamente, como tu nombre, correo electrónico, perfil y las recetas y fotos que subes a la plataforma.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. Uso de la información</h2>
        <p className="mb-4">
          Utilizamos tu información para operar la plataforma, mostrar tu perfil a la comunidad (según tus ajustes de privacidad) y mejorar la experiencia en MisArroces.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. Protección de datos</h2>
        <p className="mb-4">
          Implementamos medidas de seguridad para proteger tus datos contra el acceso no autorizado. No vendemos tu información personal a terceros.
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">4. Cookies y tecnologías similares</h2>
        <p className="mb-4">
          *Nota: El consentimiento específico de cookies no esenciales y tracking de marketing se gestionará de manera independiente a esta aceptación legal básica.*
        </p>

      </div>
    </div>
  )
}

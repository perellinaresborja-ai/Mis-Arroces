import { Construction } from "lucide-react"

export const metadata = {
  title: "Nueva Publicación | Mis Arroces",
}

export default function CreatePostPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
        <Construction className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold mb-3">Nueva Publicación</h1>
      <p className="text-muted-foreground max-w-md mx-auto">
        El creador de publicaciones estará disponible muy pronto. Podrás compartir fotos, vídeos y carruseles en el nuevo feed social de MisArroces.
      </p>
    </div>
  )
}

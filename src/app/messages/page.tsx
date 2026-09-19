import { getOrCreateConversation } from "@/app/actions/messaging"
import { redirect } from "next/navigation"
import { MessageCircle } from "lucide-react"

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined } }) {
  const sp = await Promise.resolve(searchParams);
  let creationError = null;
  
  if (sp && typeof sp.to === 'string') {
    let convId: string | undefined;
    try {
      convId = await getOrCreateConversation(sp.to)
    } catch (err) {
      console.error("Error al crear la conversación:", err)
      creationError = err instanceof Error ? err.message : String(err);
    }
    
    if (convId) {
      redirect(`/messages/${convId}`)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
      {creationError && (
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-xl mb-6 max-w-sm">
          <p className="font-bold">Error iniciando conversación</p>
          <p className="text-sm mt-1">{creationError}</p>
        </div>
      )}
      
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <MessageCircle className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Tus Mensajes</h2>
      <p className="text-muted-foreground max-w-sm">
        Selecciona una conversación a la izquierda o inicia un nuevo chat desde el perfil de otro usuario.
      </p>
    </div>
  )
}

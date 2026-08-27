import { fetchMessages, updateReadStatus, acceptRequest, rejectRequest } from "@/app/actions/messaging"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClientChat } from "@/components/domain/messages/ClientChat"

export default async function ConversationPage({ params }: { params: { conversationId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { conversationId } = await Promise.resolve(params);

  const { data: member } = await supabase
    .from('conversation_members')
    .select('status')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .single()

  if (!member) redirect('/messages')

  await updateReadStatus(conversationId)

  const { data: otherMember } = await supabase
    .from('conversation_members')
    .select('status, user_id, user:profiles!inner(id, username, display_name)')
    .eq('conversation_id', conversationId)
    .neq('user_id', user.id)
    .single()

  const messages = await fetchMessages(conversationId)

  return (
    <div className="flex flex-col h-[100dvh] max-w-xl mx-auto border-x border-border bg-background">
      <header className="p-4 border-b border-border flex items-center bg-card sticky top-0 z-30">
        <a href="/messages" className="mr-4 text-muted-foreground font-medium">Volver</a>
        <h2 className="font-bold">{otherMember?.user?.display_name || otherMember?.user?.username || "Chat"}</h2>
      </header>

      {member.status === 'REQUEST' && (
        <div className="bg-secondary p-4 rounded-2xl text-center space-y-4 m-4 z-10 relative">
          <p className="text-sm font-bold">Nueva Solicitud de Mensaje</p>
          <div className="flex justify-center gap-2">
            <form action={async () => { "use server"; await acceptRequest(conversationId); }}>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold">Aceptar</button>
            </form>
            <form action={async () => { "use server"; await rejectRequest(conversationId); }}>
              <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-xl font-bold">Rechazar</button>
            </form>
          </div>
        </div>
      )}

      <ClientChat 
        conversationId={conversationId} 
        initialMessages={messages} 
        userId={user.id} 
        myStatus={member.status}
        otherStatus={otherMember?.status}
        otherUserId={otherMember?.user_id}
      />
    </div>
  )
}

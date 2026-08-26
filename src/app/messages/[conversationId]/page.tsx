import { fetchMessages, updateReadStatus, acceptRequest, rejectRequest } from "@/app/actions/messaging"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MessageBubble } from "@/components/domain/messages/MessageBubble"
import { MessageInput } from "@/components/domain/messages/MessageInput"
import { ConversationRealtime } from "@/components/domain/messages/ConversationRealtime"

export default async function ConversationPage({ params }: { params: { conversationId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { conversationId } = params

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
    .select('user:profiles!inner(id, username, display_name)')
    .eq('conversation_id', conversationId)
    .neq('user_id', user.id)
    .single()

  const messages = await fetchMessages(conversationId)

  return (
    <div className="flex flex-col h-[100dvh] max-w-xl mx-auto border-x border-border bg-background">
      <ConversationRealtime conversationId={conversationId} />
      <header className="p-4 border-b border-border flex items-center bg-card">
        <a href="/messages" className="mr-4 text-muted-foreground">Volver</a>
        <h2 className="font-bold">{otherMember?.user?.display_name || "Chat"}</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        <div>
          {messages.map((msg: any) => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === user.id} />
          ))}
        </div>
      </div>

      {member.status === 'REQUEST' && (
        <div className="bg-secondary p-4 rounded-2xl text-center space-y-4 m-4">
          <p className="text-sm font-bold">Solicitud de mensaje</p>
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

      {member.status === 'ACTIVE' && (
        <div className="p-4 border-t border-border bg-card">
          <MessageInput conversationId={conversationId} />
        </div>
      )}
    </div>
  )
}

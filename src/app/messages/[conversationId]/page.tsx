import { fetchMessages, updateReadStatus, acceptRequest, rejectRequest } from "@/app/actions/messaging"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClientChat } from "@/components/domain/messages/ClientChat"

export default async function ConversationPage({ params }: { params: { conversationId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { conversationId } = await Promise.resolve(params);

  const { data: member, error: memberErr } = await supabase
    .from('conversation_members')
    .select('status')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error de Acceso</h1>
        <p>No se te reconoce como miembro de esta conversación.</p>
        <p className="mt-4 text-sm text-muted-foreground break-all">Conv ID: {conversationId}</p>
        <p className="text-sm text-muted-foreground break-all">User ID: {user.id}</p>
        <p className="text-sm text-muted-foreground break-all">Error: {JSON.stringify(memberErr)}</p>
      </div>
    )
  }

  await updateReadStatus(conversationId)

  const { data: otherMember } = await supabase
    .from('conversation_members')
    .select('status, user_id, user:profiles!inner(id, username, display_name)')
    .eq('conversation_id', conversationId)
    .neq('user_id', user.id)
    .single()

  const isRequest = member.status === 'REQUEST'
  const messages = await fetchMessages(conversationId)

  return (
    <div className="flex flex-col h-[100dvh] max-w-2xl mx-auto border-x border-border bg-background relative">
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card shrink-0 sticky top-0 z-10">
        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-bold">
          {otherMember?.user?.username?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="font-bold leading-none">{otherMember?.user?.display_name || otherMember?.user?.username}</h2>
          <p className="text-xs text-muted-foreground mt-1">@{otherMember?.user?.username}</p>
        </div>
      </div>
      
      {isRequest && (
        <div className="p-4 bg-muted text-center shrink-0 border-b border-border">
          <p className="text-sm font-semibold mb-2">Este usuario quiere enviarte un mensaje</p>
          <div className="flex justify-center gap-2">
            <form action={async () => {
              "use server"
              const s = await createClient()
              await s.from('conversation_members').update({ status: 'ACTIVE' }).eq('conversation_id', conversationId).eq('user_id', user.id)
              redirect(`/messages/${conversationId}`)
            }}>
              <button className="bg-primary text-primary-foreground px-4 py-1.5 rounded-xl text-sm font-bold">Aceptar</button>
            </form>
            <form action={async () => {
              "use server"
              const s = await createClient()
              await s.from('conversation_members').update({ status: 'REJECTED', rejected_at: new Date().toISOString() }).eq('conversation_id', conversationId).eq('user_id', user.id)
              redirect('/messages')
            }}>
              <button className="bg-destructive text-destructive-foreground px-4 py-1.5 rounded-xl text-sm font-bold">Rechazar</button>
            </form>
          </div>
        </div>
      )}

      <ClientChat 
        initialMessages={messages} 
        userId={user.id} 
        conversationId={conversationId} 
        isRequest={isRequest}
      />
    </div>
  )
}

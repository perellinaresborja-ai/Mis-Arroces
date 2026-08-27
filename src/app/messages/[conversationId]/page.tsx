import { fetchMessages, updateReadStatus } from "@/app/actions/messaging"
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
    .select('status, user_id, user:profiles!inner(id, username, display_name, avatar:media_assets!fk_profiles_avatar(storage_path))')
    .eq('conversation_id', conversationId)
    .neq('user_id', user.id)
    .single()

  const messages = await fetchMessages(conversationId)

  return (
    <div className="flex flex-col h-full w-full bg-background relative">
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card shrink-0 sticky top-0 z-10">
        {otherMember?.user?.avatar?.storage_path ? (
          <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe_media/${otherMember.user.avatar.storage_path}`} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" />
        ) : (
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-bold shrink-0">
            {otherMember?.user?.username?.[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="font-bold leading-none">{otherMember?.user?.display_name || otherMember?.user?.username}</h2>
          <p className="text-xs text-muted-foreground mt-1">@{otherMember?.user?.username}</p>
        </div>
      </div>
      
      <ClientChat 
        initialMessages={messages as unknown as Record<string, unknown>[]} 
        userId={user.id} 
        conversationId={conversationId} 
        myStatus={member.status}
        otherStatus={otherMember?.status}
        otherUserId={otherMember?.user_id}
      />
    </div>
  )
}

import { fetchConversations } from "@/app/actions/messaging"
import { MessagesLayoutClient } from "@/components/domain/messages/MessagesLayoutClient"

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const convs = await fetchConversations()
  return <MessagesLayoutClient convs={convs}>{children}</MessagesLayoutClient>
}

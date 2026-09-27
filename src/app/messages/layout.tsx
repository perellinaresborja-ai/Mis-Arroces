import { fetchConversations } from "@/app/actions/messaging"
import { MessagesLayoutClient } from "@/components/domain/messages/MessagesLayoutClient"

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const convsPromise = fetchConversations()
  return <MessagesLayoutClient convsPromise={convsPromise}>{children}</MessagesLayoutClient>
}

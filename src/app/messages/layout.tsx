import { MessagesLayoutClient } from "@/components/domain/messages/MessagesLayoutClient"

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return <MessagesLayoutClient>{children}</MessagesLayoutClient>
}

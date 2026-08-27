const fs = require('fs');
let code = fs.readFileSync('src/components/domain/messages/ClientChat.tsx', 'utf8');

code = code.replace(
  'const messagesEndRef = useRef<HTMLDivElement>(null)',
  `const messagesEndRef = useRef<HTMLDivElement>(null)
  const [replyingTo, setReplyingTo] = useState<Record<string, any> | null>(null)`
);

code = code.replace(
  `<MessageInput conversationId={conversationId} receiverId={otherUserId} disabled={false} />`,
  `<MessageInput conversationId={conversationId} receiverId={otherUserId} disabled={false} replyingTo={replyingTo} onCancelReply={() => setReplyingTo(null)} />`
);

code = code.replace(
  '<MessageBubble key={msg.id as string} message={msg} isOwn={msg.sender_id as string === userId} />',
  '<MessageBubble key={msg.id as string} message={msg} isOwn={msg.sender_id as string === userId} onReply={() => setReplyingTo(msg)} />'
);

code = code.replace(
  "event: 'INSERT',",
  "event: '*',"
);

code = code.replace(
  "setMessages((prev: Record<string, unknown>[]) => [...prev, payload.new as Record<string, unknown>])",
  `setMessages((prev: Record<string, unknown>[]) => {
          if (payload.eventType === 'INSERT') {
            return [...prev, payload.new as Record<string, unknown>];
          } else if (payload.eventType === 'UPDATE') {
            return prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m);
          }
          return prev;
        })`
);

fs.writeFileSync('src/components/domain/messages/ClientChat.tsx', code);

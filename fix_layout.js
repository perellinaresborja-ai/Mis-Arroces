const fs = require('fs');

let code = fs.readFileSync('src/components/domain/messages/ClientChat.tsx', 'utf8');

const oldReturn = `return (
    <div className="flex-1 overflow-y-auto flex flex-col relative pb-32 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex-1 p-4">
        {messages.map((msg: Record<string, unknown>) => (
          <MessageBubble key={msg.id as string} message={msg} isOwn={msg.sender_id as string === userId} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-16 left-0 right-0 md:absolute md:bottom-0 md:left-0 md:right-0 w-full bg-card border-t border-border p-0 z-20">
        <MessageInput conversationId={conversationId} receiverId={otherUserId} disabled={false} />
      </div>
    </div>
  )`;

const newReturn = `return (
    <div className="flex flex-col flex-1 h-full relative">
      <div className="flex-1 overflow-y-auto p-4 pb-32 md:pb-20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {messages.map((msg: Record<string, unknown>) => (
          <MessageBubble key={msg.id as string} message={msg} isOwn={msg.sender_id as string === userId} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-16 left-0 right-0 md:absolute md:bottom-0 md:left-0 md:right-0 w-full bg-card border-t border-border p-0 z-20">
        <MessageInput conversationId={conversationId} receiverId={otherUserId} disabled={false} />
      </div>
    </div>
  )`;

code = code.replace(oldReturn, newReturn);
fs.writeFileSync('src/components/domain/messages/ClientChat.tsx', code);

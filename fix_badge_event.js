const fs = require('fs');

let badge = fs.readFileSync('src/components/domain/messages/UnreadBadge.tsx', 'utf8');

if (!badge.includes('messages_read')) {
  badge = badge.replace(
    /return \(\) => \{ supabase\.removeChannel\(channel\) \}/,
    `const handleRead = () => fetchCount();
    window.addEventListener('messages_read', handleRead);

    return () => { 
      supabase.removeChannel(channel);
      window.removeEventListener('messages_read', handleRead);
    }`
  );
  fs.writeFileSync('src/components/domain/messages/UnreadBadge.tsx', badge);
  console.log("ADDED CUSTOM EVENT TO UNREAD BADGE");
}

let chat = fs.readFileSync('src/components/domain/messages/ClientChat.tsx', 'utf8');

if (!chat.includes('messages_read')) {
  chat = chat.replace(
    /updateReadStatus\(conversationId\);/,
    `updateReadStatus(conversationId).then(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('messages_read'));
      }
    });`
  );
  fs.writeFileSync('src/components/domain/messages/ClientChat.tsx', chat);
  console.log("ADDED DISPATCH TO CLIENT CHAT");
}

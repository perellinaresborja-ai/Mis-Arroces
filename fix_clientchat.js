const fs = require('fs');

let clientChat = fs.readFileSync('src/components/domain/messages/ClientChat.tsx', 'utf8');

if (!clientChat.includes('updateReadStatus')) {
  clientChat = clientChat.replace(
    /import \{ MessageInput \} from "@\/components\/domain\/messages\/MessageInput"/,
    `import { MessageInput } from "@/components/domain/messages/MessageInput"\nimport { updateReadStatus } from "@/app/actions/messaging"`
  );
  
  // Add useEffect to call updateReadStatus
  clientChat = clientChat.replace(
    /useEffect\(\(\) => \{\n\s*messagesEndRef\.current\?\.scrollIntoView/,
    `useEffect(() => {
    updateReadStatus(conversationId);
  }, [messages, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView`
  );
  
  fs.writeFileSync('src/components/domain/messages/ClientChat.tsx', clientChat);
  console.log("ADDED UPDATEREADSTATUS TO CLIENTCHAT");
} else {
  console.log("ALREADY INCLUDES UPDATEREADSTATUS");
}

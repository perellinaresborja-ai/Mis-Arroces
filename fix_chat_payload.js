const fs = require('fs');

let code = fs.readFileSync('src/components/domain/messages/ClientChat.tsx', 'utf8');

const oldHandler = `setMessages((prev) => {
          if (prev.find(m => m.id === payload.new.id)) return prev
          return [...prev, payload.new as Record<string, unknown>].sort((a, b) => new Date((a.created_at as string) || '').getTime() - new Date((b.created_at as string) || '').getTime())
        })`;

const newHandler = `setMessages((prev) => {
          const newPayload = payload.new as Record<string, unknown>;
          if (payload.eventType === 'INSERT') {
            if (prev.find(m => m.id === newPayload.id)) return prev;
            return [...prev, newPayload].sort((a, b) => new Date((a.created_at as string) || '').getTime() - new Date((b.created_at as string) || '').getTime());
          } else if (payload.eventType === 'UPDATE') {
            return prev.map(m => m.id === newPayload.id ? { ...m, ...newPayload } : m);
          }
          return prev;
        })`;

code = code.replace(oldHandler, newHandler);
fs.writeFileSync('src/components/domain/messages/ClientChat.tsx', code);

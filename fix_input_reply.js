const fs = require('fs');
let code = fs.readFileSync('src/components/domain/messages/MessageInput.tsx', 'utf8');

code = code.replace(
  'export function MessageInput({ conversationId, receiverId, disabled }: { conversationId: string, receiverId?: string, disabled?: boolean }) {',
  'export function MessageInput({ conversationId, receiverId, disabled, replyingTo, onCancelReply }: { conversationId: string, receiverId?: string, disabled?: boolean, replyingTo?: Record<string, any> | null, onCancelReply?: () => void }) {'
);

code = code.replace(
  'const { data: msg, error: msgError } = await supabase.from(\'messages\').insert({',
  `const { data: msg, error: msgError } = await supabase.from('messages').insert({
        reply_to_id: replyingTo?.id || null,`
);

// clear reply state after send
code = code.replace(
  'setContent("")',
  `setContent("")
      if (onCancelReply) onCancelReply()`
);

const renderPrefix = `<div className="flex flex-col w-full">`;
const renderReplyPreview = `
      {replyingTo && (
        <div className="bg-muted px-4 py-2 flex items-center justify-between border-b border-border text-sm">
          <div className="truncate opacity-70 flex-1">
            <span className="font-bold mr-2">Respondiendo a:</span>
            {replyingTo.type === 'IMAGE' || replyingTo.type === 'VIDEO' ? 'Archivo adjunto' : replyingTo.body || replyingTo.content}
          </div>
          <button type="button" onClick={onCancelReply} className="p-1 hover:bg-background rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
`;

code = code.replace(
  '<form onSubmit={handleSend} className="flex items-end gap-2 p-4">',
  renderPrefix + renderReplyPreview + '<form onSubmit={handleSend} className="flex items-end gap-2 p-4">'
);

code = code.replace(
  '</form>',
  '</form>\n    </div>'
);

fs.writeFileSync('src/components/domain/messages/MessageInput.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/components/domain/messages/MessageInput.tsx', 'utf8');

const newReturn = `
  return (
    <div className="flex flex-col w-full bg-card border-t border-border">
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
      <form onSubmit={handleSend} className="p-4">
`;

code = code.replace(
  '  return (\n    <form onSubmit={handleSend} className="p-4 border-t border-border bg-card">',
  newReturn
);

code = code.replace(
  '    </form>\n  )\n}',
  '    </form>\n    </div>\n  )\n}'
);

fs.writeFileSync('src/components/domain/messages/MessageInput.tsx', code);

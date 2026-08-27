const fs = require('fs');
let code = fs.readFileSync('src/components/domain/messages/MessageBubble.tsx', 'utf8');

// Add ChevronDown icon
code = code.replace(
  'import Link from "next/link"',
  'import Link from "next/link"\nimport { ChevronDown, Reply, Copy, Trash2 } from "lucide-react"\nimport { unsendMessage } from "@/app/actions/messaging"'
);

// Add onReply prop
code = code.replace(
  'export function MessageBubble({ message, isOwn }: { message: Record<string, unknown>, isOwn: boolean }) {',
  'export function MessageBubble({ message, isOwn, onReply }: { message: Record<string, unknown>, isOwn: boolean, onReply?: () => void }) {'
);

// Add state for menu and reply
const states = `  const [showMenu, setShowMenu] = useState(false);
  const [replyData, setReplyData] = useState<Record<string, any> | null>(message.parent as any || null);
  const isDeleted = !!message.deleted_at;

  useEffect(() => {
    if (message.reply_to_id && !replyData) {
      supabase.from('messages').select('type, body, content').eq('id', message.reply_to_id as string).single().then(({data}) => {
        if (data) setReplyData(data);
      });
    }
  }, [message.reply_to_id, replyData, supabase]);

  const handleCopy = () => {
    navigator.clipboard.writeText(mContent);
    setShowMenu(false);
  };

  const handleUnsend = async () => {
    await unsendMessage(message.id as string);
    setShowMenu(false);
  };

  const handleReply = () => {
    if (onReply) onReply();
    setShowMenu(false);
  };
`;

code = code.replace(
  'const supabase = createClient();',
  'const supabase = createClient();\n' + states
);

// Render deleted state
const renderDeleted = `
      <div className={\`max-w-[75%] rounded-2xl p-3 \${isOwn ? "bg-primary/50 text-primary-foreground/50 rounded-tr-sm" : "bg-muted/50 text-foreground/50 rounded-tl-sm"}\`}>
        <p className="text-sm italic flex items-center gap-2"><Trash2 className="w-4 h-4"/> Mensaje eliminado</p>
      </div>
    </div>
  )
}
`;

code = code.replace(
  'return (',
  `if (isDeleted) {
    return (
      <div className={\`flex w-full mb-4 \${isOwn ? "justify-end" : "justify-start"}\`}>
${renderDeleted}
  return (`
);

// Render quoted reply
const renderQuote = `
        {replyData && (
          <div className="bg-background/20 rounded-xl p-2 mb-2 text-xs opacity-80 border-l-2 border-primary">
            <span className="font-bold block mb-1">Respuesta a:</span>
            <span className="truncate block">
              {replyData.type === 'IMAGE' || replyData.type === 'VIDEO' ? 'Archivo adjunto' : replyData.body || replyData.content}
            </span>
          </div>
        )}
`;

code = code.replace(
  '{mType === \'IMAGE\' && realtimeUrl && (',
  renderQuote + '\n        {mType === \'IMAGE\' && realtimeUrl && ('
);

// Add interaction menu toggle
const renderMenuToggle = `
      <div className={\`relative group max-w-[75%]\`}>
        <div className={\`rounded-2xl p-3 relative \${isOwn ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}\`}>
`;

code = code.replace(
  '<div className={`max-w-[75%] rounded-2xl p-3 ${isOwn ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>',
  renderMenuToggle
);

const renderMenuBtn = `
          {/* Dropdown Menu */}
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className={\`absolute top-1 \${isOwn ? '-left-6' : '-right-6'} opacity-0 group-hover:opacity-100 p-1 bg-card rounded-full shadow-sm border border-border text-foreground transition-opacity\`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className={\`absolute top-8 \${isOwn ? '-left-32' : '-right-32'} w-32 bg-card border border-border shadow-lg rounded-xl overflow-hidden z-50 text-foreground\`}>
              <button onClick={handleReply} className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted transition-colors">
                <Reply className="w-4 h-4" /> Responder
              </button>
              {mContent && (
                <button onClick={handleCopy} className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted transition-colors">
                  <Copy className="w-4 h-4" /> Copiar
                </button>
              )}
              {isOwn && (
                <button onClick={handleUnsend} className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" /> Anular
                </button>
              )}
            </div>
          )}
`;

code = code.replace(
  '</div>\n    </div>',
  '</div>\n' + renderMenuBtn + '      </div>\n    </div>'
);

fs.writeFileSync('src/components/domain/messages/MessageBubble.tsx', code);

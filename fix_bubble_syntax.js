const fs = require('fs');
let code = fs.readFileSync('src/components/domain/messages/MessageBubble.tsx', 'utf8');

const returnBlockStart = code.indexOf('if (isDeleted) {');
const newReturnBlock = `if (isDeleted) {
    return (
      <div className={\`flex w-full mb-4 \${isOwn ? "justify-end" : "justify-start"}\`}>
        <div className={\`max-w-[75%] rounded-2xl p-3 \${isOwn ? "bg-primary/50 text-primary-foreground/50 rounded-tr-sm" : "bg-muted/50 text-foreground/50 rounded-tl-sm"}\`}>
          <p className="text-sm italic flex items-center gap-2"><Trash2 className="w-4 h-4"/> Mensaje eliminado</p>
        </div>
      </div>
    )
  }

  return (
    <div className={\`flex w-full mb-4 \${isOwn ? "justify-end" : "justify-start"}\`}>
      <div className="relative group max-w-[75%]">
        <div className={\`rounded-2xl p-3 relative \${isOwn ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}\`}>
          {replyData && (
            <div className="bg-background/20 rounded-xl p-2 mb-2 text-xs opacity-80 border-l-2 border-primary">
              <span className="font-bold block mb-1">Respuesta a:</span>
              <span className="truncate block">
                {replyData.type === 'IMAGE' || replyData.type === 'VIDEO' ? 'Archivo adjunto' : replyData.body || replyData.content}
              </span>
            </div>
          )}

          {mType === 'IMAGE' && realtimeUrl && (
            <img src={realtimeUrl} alt="Media" className="rounded-xl w-full object-cover mb-2 max-h-64 cursor-pointer" />
          )}
          
          {mType === 'VIDEO' && realtimeUrl && (
            <video src={realtimeUrl} controls playsInline className="rounded-xl w-full object-cover mb-2 max-h-64" />
          )}

          {mType === 'LINK' && (
            <a href={mContent} target="_blank" rel="noopener noreferrer" className="text-sm underline break-words">
              {mContent}
            </a>
          )}

          {(mType === 'RECIPE' || mType === 'SESSION' || mType === 'STORY') && (
            <div className="bg-background/10 rounded-xl p-3 mb-2 border border-border text-foreground">
              {entityStatus === 'LOADING' && <p className="text-xs opacity-70">Cargando...</p>}
              {entityStatus === 'EXPIRED' && <p className="text-xs font-bold">Story expirada</p>}
              {entityStatus === 'UNAVAILABLE' && <p className="text-xs font-bold">No disponible</p>}
              {entityStatus === 'LOADED' && entityData && (
                <>
                  <p className="font-semibold text-sm mb-1">{mType} Compartido</p>
                  {entityData.title && <p className="text-xs truncate">{entityData.title as string}</p>}
                  <Link href={\`/\${mType.toLowerCase()}s/\${mEntityId}\`} className="text-xs underline mt-2 block">
                    Ver {mType}
                  </Link>
                </>
              )}
            </div>
          )}

          {mType === 'TEXT' && (
            <p className="text-sm whitespace-pre-wrap break-words">{mContent}</p>
          )}
          
          {(mType === 'IMAGE' || mType === 'VIDEO') && mContent && (
            <p className="text-sm mt-1 whitespace-pre-wrap break-words">{mContent}</p>
          )}

          <div className={\`text-[10px] mt-1 opacity-70 \${isOwn ? "text-right" : "text-left"}\`}>
            {formatRelativeTime(mCreatedAt)}
          </div>
        </div>
        
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
      </div>
    </div>
  )
}
`;

code = code.substring(0, returnBlockStart) + newReturnBlock;
fs.writeFileSync('src/components/domain/messages/MessageBubble.tsx', code);

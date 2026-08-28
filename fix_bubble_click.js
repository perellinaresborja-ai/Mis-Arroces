const fs = require('fs');

let code = fs.readFileSync('src/components/domain/messages/MessageBubble.tsx', 'utf8');

const oldBubbleStart = `        <div className={\`rounded-2xl p-3 relative \${isOwn ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}\`}>`;

const newBubbleStart = `        <div 
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className={\`rounded-2xl p-3 relative cursor-pointer \${isOwn ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}\`}
        >`;

code = code.replace(oldBubbleStart, newBubbleStart);

const oldMenuButton = `{/* Dropdown Menu */}
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className={\`absolute top-1 \${isOwn ? '-left-6' : '-right-6'} opacity-0 group-hover:opacity-100 p-1 bg-card rounded-full shadow-sm border border-border text-foreground transition-opacity\`}
        >
          <ChevronDown className="w-4 h-4" />
        </button>`;

code = code.replace(oldMenuButton, "");

fs.writeFileSync('src/components/domain/messages/MessageBubble.tsx', code);

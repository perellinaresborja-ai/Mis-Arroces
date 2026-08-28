const fs = require('fs');

let code = `
function renderOverlayContent(overlay: StoryOverlay) {
  switch (overlay.type) {
    case 'TEXT':
      return (
        <div className="px-4 py-2 font-bold text-center whitespace-pre-wrap break-words" style={{ color: overlay.payload.color, backgroundColor: overlay.payload.backgroundColor, fontFamily: overlay.payload.fontFamily, textAlign: overlay.payload.align as any, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
          {overlay.payload.text}
        </div>
      );
    case 'MENTION':
      return <div className="bg-gradient-to-tr from-pink-500 to-orange-400 text-white px-3 py-1 rounded-full font-bold shadow-lg">@{overlay.payload.username}</div>;
    case 'LOCATION':
      return <div className="bg-white/90 text-black px-3 py-1 rounded-lg font-bold flex items-center gap-1 shadow-lg"><MapPin className="w-4 h-4"/> {overlay.payload.location}</div>;
    case 'RECIPE':
      return <div className="bg-card/95 border border-border text-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-xl"><Utensils className="w-5 h-5"/> <div><div className="text-xs text-muted-foreground">Receta</div><div className="text-sm">{overlay.payload.title}</div></div></div>;
    case 'INGREDIENT':
      return <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-bold shadow-lg text-sm">{overlay.payload.name}</div>;
    case 'PROFILE':
      return <div className="bg-background text-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-xl border border-border">👤 {overlay.payload.username}</div>;
    case 'SESSION':
      return <div className="bg-orange-100 text-orange-900 px-3 py-1 rounded-xl font-bold shadow-lg text-sm flex flex-col items-center"><div>🔥 Sesión</div><div className="text-xs opacity-80">{overlay.payload.title}</div></div>;
    case 'POLL':
      return (
        <div className="bg-background/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-border/50 min-w-[200px] pointer-events-auto">
          <div className="p-3 text-center font-bold text-foreground border-b border-border/50">{overlay.payload.question}</div>
          <div className="flex divide-x divide-border/50">
            <button className="flex-1 p-3 text-center font-bold hover:bg-muted text-primary transition-colors">{overlay.payload.optionA}</button>
            <button className="flex-1 p-3 text-center font-bold hover:bg-muted text-primary transition-colors">{overlay.payload.optionB}</button>
          </div>
        </div>
      );
    case 'QUESTION':
      return (
        <div className="bg-background/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-border/50 min-w-[220px] flex flex-col gap-3 pointer-events-auto">
          <div className="font-bold text-foreground">{overlay.payload.question}</div>
          <input type="text" placeholder="Escribe tu respuesta..." className="w-full bg-muted/50 rounded-xl px-3 py-2 text-sm outline-none border border-transparent focus:border-border" />
          <button className="bg-primary text-primary-foreground font-bold rounded-xl py-2 text-sm">Enviar a DM</button>
        </div>
      );
    case 'SLIDER':
      return (
        <div className="bg-background/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-border/50 min-w-[200px] flex flex-col items-center gap-3 pointer-events-auto">
          <div className="font-bold text-foreground">{overlay.payload.question}</div>
          <div className="w-full flex items-center gap-2">
            <div className="text-2xl">{overlay.payload.emoji}</div>
            <input type="range" min="0" max="100" defaultValue="50" className="flex-1 accent-primary" />
          </div>
        </div>
      );
    case 'GIF':
      return <img src={overlay.payload.url} className="w-32 h-auto rounded-lg shadow-lg pointer-events-none" />;
    default:
      return null;
  }
}
`;

let content = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

// replace everything from function renderOverlayContent down to the end of the file
const start = content.indexOf('function renderOverlayContent');
if (start !== -1) {
  content = content.substring(0, start) + code;
  fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', content);
}

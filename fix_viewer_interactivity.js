const fs = require('fs');

let c = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');
const interactive = `
function renderOverlayContent(overlay: StoryOverlay) {
  const handlePollVote = async (opt: 'A'|'B') => {
    if (mode === 'VIEWER') {
      try {
        const { votePoll } = await import('@/app/actions/stories');
        await votePoll("mock", overlay.id, opt);
        alert('Voto registrado');
      } catch (e) {
        console.error(e)
      }
    }
  };

  const handleQuestionSubmit = async (e: any) => {
    e.preventDefault();
    if (mode === 'VIEWER') {
      try {
        const { submitQuestionReply } = await import('@/app/actions/stories');
        await submitQuestionReply("mock", "mock-owner", overlay.payload.question, e.target.answer.value);
        e.target.answer.value = '';
        alert('Respuesta enviada a DM');
      } catch (err) {
        console.error(err)
      }
    }
  };

  switch (overlay.type) {
    case 'TEXT':
      return (
        <div className="px-4 py-2 font-bold text-center whitespace-pre-wrap break-words" style={{ color: overlay.payload.color, backgroundColor: overlay.payload.backgroundColor, fontFamily: overlay.payload.fontFamily, textAlign: overlay.payload.align as any, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
          {overlay.payload.text}
        </div>
      );
    case 'MENTION':
      return <div className="bg-gradient-to-tr from-pink-500 to-orange-400 text-white px-3 py-1 rounded-full font-bold shadow-lg cursor-pointer" onClick={() => mode === 'VIEWER' && (window.location.href = '/' + overlay.payload.username)}>@{overlay.payload.username}</div>;
    case 'LOCATION':
      return <div className="bg-white/90 text-black px-3 py-1 rounded-lg font-bold flex items-center gap-1 shadow-lg cursor-pointer"><MapPin className="w-4 h-4"/> {overlay.payload.name}</div>;
    case 'RECIPE':
      return <div className="bg-card/95 border border-border text-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-xl cursor-pointer" onClick={() => mode === 'VIEWER' && (window.location.href = '/recipes/' + overlay.payload.recipeId)}><Utensils className="w-5 h-5"/> <div><div className="text-xs text-muted-foreground">Receta</div><div className="text-sm">{((overlay.payload as any).title || (overlay.payload as any).authorName || "")}</div></div></div>;
    case 'INGREDIENT':
      return <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-bold shadow-lg text-sm cursor-pointer">{overlay.payload.name}</div>;
    case 'PROFILE':
      return <div className="bg-background text-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-xl border border-border cursor-pointer" onClick={() => mode === 'VIEWER' && (window.location.href = '/' + overlay.payload.username)}>👤 {overlay.payload.username}</div>;
    case 'SESSION':
      return <div className="bg-orange-100 text-orange-900 px-3 py-1 rounded-xl font-bold shadow-lg text-sm flex flex-col items-center cursor-pointer" onClick={() => mode === 'VIEWER' && (window.location.href = '/sessions/' + overlay.payload.sessionId)}><div>🔥 Sesión</div><div className="text-xs opacity-80">{((overlay.payload as any).title || (overlay.payload as any).authorName || "")}</div></div>;
    case 'POLL':
      return (
        <div className="bg-background/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-border/50 min-w-[200px] pointer-events-auto">
          <div className="p-3 text-center font-bold text-foreground border-b border-border/50">{overlay.payload.question}</div>
          <div className="flex divide-x divide-border/50">
            <button onClick={() => handlePollVote('A')} className="flex-1 p-3 text-center font-bold hover:bg-muted text-primary transition-colors cursor-pointer">{overlay.payload.optionA}</button>
            <button onClick={() => handlePollVote('B')} className="flex-1 p-3 text-center font-bold hover:bg-muted text-primary transition-colors cursor-pointer">{overlay.payload.optionB}</button>
          </div>
        </div>
      );
    case 'QUESTION':
      return (
        <form onSubmit={handleQuestionSubmit} className="bg-background/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-border/50 min-w-[220px] flex flex-col gap-3 pointer-events-auto">
          <div className="font-bold text-foreground">{overlay.payload.question}</div>
          <input name="answer" type="text" placeholder="Escribe tu respuesta..." className="w-full bg-muted/50 rounded-xl px-3 py-2 text-sm outline-none border border-transparent focus:border-border cursor-text" />
          <button type="submit" className="bg-primary text-primary-foreground font-bold rounded-xl py-2 text-sm cursor-pointer">Enviar a DM</button>
        </form>
      );
    case 'SLIDER':
      return (
        <div className="bg-background/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-border/50 min-w-[200px] flex flex-col items-center gap-3 pointer-events-auto">
          <div className="font-bold text-foreground">{overlay.payload.question}</div>
          <div className="w-full flex items-center gap-2 cursor-pointer">
            <div className="text-2xl">{overlay.payload.emoji}</div>
            <input type="range" min="0" max="100" defaultValue="50" className="flex-1 accent-primary cursor-grab" />
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
c = c.substring(0, c.indexOf('function renderOverlayContent')) + interactive;
fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', c);

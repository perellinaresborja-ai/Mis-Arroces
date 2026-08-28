const fs = require('fs');

let creator = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

const stickerTray = `
      {/* V3 Sticker Tray */}
      <div className="absolute top-20 right-4 flex flex-col gap-2 z-50">
        <button className="bg-black/60 p-2 rounded-full text-white hover:bg-black" onClick={() => setOverlays([...overlays, { id: 'poll_'+Date.now(), type: 'POLL', x: 0.5, y: 0.5, scale: 1, rotation: 0, zIndex: overlays.length, payload: { question: '¿Cuál prefieres?', optionA: 'Opción A', optionB: 'Opción B' } }])} title="Encuesta">📊</button>
        <button className="bg-black/60 p-2 rounded-full text-white hover:bg-black" onClick={() => setOverlays([...overlays, { id: 'q_'+Date.now(), type: 'QUESTION', x: 0.5, y: 0.6, scale: 1, rotation: 0, zIndex: overlays.length, payload: { question: 'Hazme una pregunta' } }])} title="Pregunta">❓</button>
        <button className="bg-black/60 p-2 rounded-full text-white hover:bg-black" onClick={() => setOverlays([...overlays, { id: 'slider_'+Date.now(), type: 'SLIDER', x: 0.5, y: 0.7, scale: 1, rotation: 0, zIndex: overlays.length, payload: { question: '¿Cuánto te gusta?', emoji: '😋' } }])} title="Slider">🎚️</button>
        <button className="bg-black/60 p-2 rounded-full text-white hover:bg-black" onClick={() => setIsDrawingMode(!isDrawingMode)} title="Dibujar">🖌️</button>
        <button className="bg-black/60 p-2 rounded-full text-white hover:bg-black" onClick={() => setAllowReplies(!allowReplies)} title={allowReplies ? 'Respuestas permitidas' : 'Respuestas bloqueadas'}>
          {allowReplies ? '💬' : '🔇'}
        </button>
      </div>
`;

if (!creator.includes('V3 Sticker Tray')) {
  creator = creator.replace(
    /\{mode === 'EDIT' && \(/,
    `{mode === 'EDIT' && (\n${stickerTray}`
  );
  fs.writeFileSync('src/components/domain/StoryCreator.tsx', creator);
  console.log("INJECTED STICKER TRAY");
}

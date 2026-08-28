const fs = require('fs');

let renderer = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

if (!renderer.includes('PollOverlayComponent')) {
  // Add interactive components
  const interactiveComponents = `
function InteractivePoll({ overlay, mode }: { overlay: any, mode: any }) {
  return (
    <div 
      className="bg-white rounded-xl shadow-lg p-3 text-center pointer-events-auto"
      style={{ minWidth: '200px' }}
      onPointerDown={(e) => { e.stopPropagation(); }}
      onClick={(e) => { e.stopPropagation(); }}
    >
      <div className="font-bold mb-2 text-black">{overlay.payload.question}</div>
      <div className="flex gap-2">
        <button 
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-black py-1.5 rounded-lg text-sm font-medium transition-colors"
          onClick={() => { if (mode === 'VIEWER') alert('Voto registrado'); }}
        >
          {overlay.payload.optionA}
        </button>
        <button 
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-black py-1.5 rounded-lg text-sm font-medium transition-colors"
          onClick={() => { if (mode === 'VIEWER') alert('Voto registrado'); }}
        >
          {overlay.payload.optionB}
        </button>
      </div>
    </div>
  );
}

function InteractiveQuestion({ overlay, mode }: { overlay: any, mode: any }) {
  return (
    <div 
      className="bg-white rounded-xl shadow-lg p-4 text-center pointer-events-auto"
      style={{ minWidth: '220px' }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="font-bold mb-2 text-black">{overlay.payload.question}</div>
      {mode === 'VIEWER' ? (
        <input 
          type="text" 
          placeholder="Escribe una respuesta..." 
          className="w-full bg-gray-100 border-none rounded-lg text-sm px-3 py-2 text-black focus:ring-2 focus:ring-primary outline-none" 
        />
      ) : (
        <div className="w-full bg-gray-100 rounded-lg text-sm px-3 py-2 text-gray-400 text-left">Escribe una respuesta...</div>
      )}
    </div>
  );
}

function InteractiveSlider({ overlay, mode }: { overlay: any, mode: any }) {
  return (
    <div 
      className="bg-white rounded-xl shadow-lg p-3 text-center pointer-events-auto"
      style={{ minWidth: '200px' }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="font-bold mb-2 text-black">{overlay.payload.question}</div>
      <input type="range" min="0" max="100" defaultValue="50" className="w-full accent-primary" />
      <div className="text-2xl mt-1">{overlay.payload.emoji}</div>
    </div>
  );
}
`;

  renderer = renderer.replace('export function SharedStoryRenderer', interactiveComponents + '\nexport function SharedStoryRenderer');

  // Inject rendering in the switch statement
  renderer = renderer.replace(
    /case 'TEXT':\n\s*return \(\n\s*<div/,
    `case 'POLL': return <InteractivePoll overlay={overlay} mode={mode} />;
        case 'QUESTION': return <InteractiveQuestion overlay={overlay} mode={mode} />;
        case 'SLIDER': return <InteractiveSlider overlay={overlay} mode={mode} />;
        case 'TEXT':
          return (
            <div`
  );

  fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', renderer);
  console.log("INJECTED INTERACTIVE STICKERS");
}

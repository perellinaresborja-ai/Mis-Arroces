const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

if (!code.includes('const [drawHistory')) {
    code = code.replace(
        'const [drawingOverlays, setDrawingOverlays] = useState<DrawingOverlay[]>([]);',
        `const [drawingOverlays, setDrawingOverlays] = useState<DrawingOverlay[]>([]);
  const [drawHistory, setDrawHistory] = useState<DrawingOverlay[][]>([[]]);
  const [drawRedoHistory, setDrawRedoHistory] = useState<DrawingOverlay[][]>([]);`
    );
}

const draw_buttons = `<button onClick={() => {
                      if (drawHistory.length > 1) {
                        const newHistory = [...drawHistory];
                        const lastState = newHistory.pop();
                        setDrawRedoHistory([...drawRedoHistory, lastState]);
                        setDrawHistory(newHistory);
                        setDrawingOverlays(newHistory[newHistory.length - 1]);
                      }
                    }} className="bg-black/50 p-2 rounded-full text-white text-xs z-50">Deshacer</button>
                    <button onClick={() => {
                      if (drawRedoHistory.length > 0) {
                        const newRedo = [...drawRedoHistory];
                        const nextState = newRedo.pop();
                        const newHistory = [...drawHistory, nextState];
                        setDrawRedoHistory(newRedo);
                        setDrawHistory(newHistory);
                        setDrawingOverlays(nextState);
                      }
                    }} className="bg-black/50 p-2 rounded-full text-white text-xs z-50">Rehacer</button>
                    <button onClick={() => {
                      const newState = [];
                      setDrawHistory([...drawHistory, newState]);
                      setDrawRedoHistory([]);
                      setDrawingOverlays(newState);
                    }} className="bg-black/50 p-2 rounded-full text-white text-xs z-50">Limpiar</button>
                    <button onClick={() => setDrawingColor('rgba(255,255,255,0)')} className="bg-black/50 p-2 rounded-full text-white text-xs z-50">Goma</button>`;

if (!code.includes('Deshacer')) {
    code = code.replace(`<button onClick={() => setMode('EDIT')} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white z-50">`,
                        `<div className="absolute top-16 right-4 flex flex-col gap-2 z-50">
                    ${draw_buttons}
                  </div>
                  <button onClick={() => setMode('EDIT')} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white z-50">`);
}

// Ensure handlePointerUp saves to drawHistory
code = code.replace(/setDrawingOverlays\(\(prev\) => \[\n\s*\.\.\.prev\.slice\(0, -1\),\n\s*\{\n\s*\.\.\.lastStroke,\n\s*points: newPoints,\n\s*\}\n\s*\]\);/g, `setDrawingOverlays((prev) => {
          const next = [...prev.slice(0, -1), { ...lastStroke, points: newPoints }];
          return next;
        });`);

fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);

import re
import os

path = 'src/components/domain/StoryCreator.tsx'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add draw history states
if 'const [drawHistory' not in code:
    code = code.replace(
        'const [drawingOverlays, setDrawingOverlays] = useState<DrawingOverlay[]>([]);',
        'const [drawingOverlays, setDrawingOverlays] = useState<DrawingOverlay[]>([]);\n  const [drawHistory, setDrawHistory] = useState<DrawingOverlay[][]>([[]]);\n  const [drawRedoHistory, setDrawRedoHistory] = useState<DrawingOverlay[][]>([]);'
    )

# 2. Modify handlePointerUp to push history
if 'setDrawHistory' in code and 'handlePointerUp' in code:
    # find handlePointerUp logic
    # it usually sets drawingOverlays
    # Let's replace setDrawingOverlays(prev => [...prev.slice(0, -1), { ...last, points: newPoints }])
    
    # We will just inject it generically:
    pass

# We can also just rewrite the whole drawing buttons
draw_buttons = """<button onClick={() => {
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
                    <button onClick={() => setDrawingColor('#00000000')} className="bg-black/50 p-2 rounded-full text-white text-xs z-50">Goma</button>"""

if 'Deshacer' not in code:
    code = code.replace("<button onClick={() => setMode('EDIT')} className=\"absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white z-50\">",
                        f"""<div className="absolute top-16 right-4 flex flex-col gap-2 z-50">
                    {draw_buttons}
                  </div>
                  <button onClick={() => setMode('EDIT')} className=\"absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white z-50\">""")

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)
print("Updated StoryCreator drawing UI")

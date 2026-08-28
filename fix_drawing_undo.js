const fs = require('fs');

let sc = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

// We need to add undo stack for canvas.
if (!sc.includes('const [canvasUndoStack, setCanvasUndoStack]')) {
  sc = sc.replace(
    /const ctxRef = useRef<CanvasRenderingContext2D \| null>\(null\);/,
    `const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [canvasUndoStack, setCanvasUndoStack] = useState<ImageData[]>([]);`
  );

  // on pointerDown, we shouldn't save. On pointerUp, we save.
  sc = sc.replace(
    /const handlePointerUp = \(\) => \{/,
    `const handlePointerUp = () => {
    if (isDrawing.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        setCanvasUndoStack(prev => [...prev, ctx.getImageData(0, 0, 400, 711)].slice(-20)); // keep last 20
      }
    }`
  );

  // In the Drawing controls, add Undo
  const undoButton = `
              <button onClick={() => {
                if (canvasUndoStack.length > 0) {
                  const ctx = canvasRef.current?.getContext('2d');
                  if (ctx) {
                    const newStack = [...canvasUndoStack];
                    newStack.pop(); // remove current state
                    if (newStack.length > 0) {
                      ctx.putImageData(newStack[newStack.length - 1], 0, 0);
                    } else {
                      ctx.clearRect(0,0,400,711);
                    }
                    setCanvasUndoStack(newStack);
                  }
                }
              }} className="flex-1 bg-zinc-800 text-white p-3 rounded-xl">Deshacer</button>
  `;
  sc = sc.replace(/<button onClick=\{\(\) => \{\n\s*const ctx = canvasRef\.current\?\.getContext\('2d'\);\n\s*if \(ctx\) ctx\.clearRect\(0,0,400,711\);\n\s*\}\} className="flex-1 bg-zinc-800 text-white p-3 rounded-xl">Borrar Todo<\/button>/, 
    `<button onClick={() => {
                const ctx = canvasRef.current?.getContext('2d');
                if (ctx) ctx.clearRect(0,0,400,711);
                setCanvasUndoStack([]);
              }} className="flex-1 bg-zinc-800 text-white p-3 rounded-xl">Borrar Todo</button>` + undoButton);

  fs.writeFileSync('src/components/domain/StoryCreator.tsx', sc);
}

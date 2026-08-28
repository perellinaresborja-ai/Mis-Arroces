const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

const targetA11y = `<span className="text-[10px] text-center font-bold uppercase text-white/50 mb-1">A11y</span>`;

// We will remove the whole ACCESSIBILITY CONTROLS block because they don't want it (they just want to pinch).
// Wait, the a11y controls are useful for desktop users who can't pinch!
// The user said: "no quiero que aparezca eso de A11Y".
// I'll just remove the label "A11Y". And maybe they meant the whole block? "no quiero que aparezca eso de A11Y". 
// I'll just remove the <span> tag for now, or just remove the whole block.
// "no quiero que aparezca eso de A11Y y que la foto solo... se pueda ampliar pellicando"
// This implies they want to rely entirely on pinching, and don't want the A11Y box at all.

const targetBlock = `{/* ACCESSIBILITY CONTROLS */}
            {mode === 'EDITOR' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40 bg-black/50 p-2 rounded-2xl backdrop-blur-md">
                <span className="text-[10px] text-center font-bold uppercase text-white/50 mb-1">A11y</span>
                {!selectedOverlayId ? (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => setTransform(prev => ({...prev, scale: prev.scale + 0.1}))} title="Zoom In Media">+</Button>
                    <Button variant="ghost" size="icon" onClick={() => setTransform(prev => ({...prev, scale: Math.max(0.1, prev.scale - 0.1)}))} title="Zoom Out Media">-</Button>
                    <Button variant="ghost" size="icon" onClick={() => setTransform(prev => ({...prev, translateY: prev.translateY - 20}))} title="Move Up">↑</Button>
                    <Button variant="ghost" size="icon" onClick={() => setTransform(prev => ({...prev, translateY: prev.translateY + 20}))} title="Move Down">↓</Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => updateSelectedOverlay({ scale: (overlays.find(o => o.id === selectedOverlayId)?.scale || 1) + 0.1 })} title="Zoom In Overlay">+</Button>
                    <Button variant="ghost" size="icon" onClick={() => updateSelectedOverlay({ scale: Math.max(0.1, (overlays.find(o => o.id === selectedOverlayId)?.scale || 1) - 0.1) })} title="Zoom Out Overlay">-</Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      const o = overlays.find(o => o.id === selectedOverlayId);
                      if (o) updateSelectedOverlay({ rotation: o.rotation + 15 })
                    }} title="Rotate">↻</Button>
                  </>
                )}
              </div>
            )}`;

if (code.includes(targetBlock)) {
  code = code.replace(targetBlock, '');
} else {
  // Just in case formatting differs
  const regex = /\{\/\* ACCESSIBILITY CONTROLS \*\/\}.*?<\/div>\s*\)\}/s;
  code = code.replace(regex, '');
}

fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);

const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

// 1. Remove Pointer event handlers completely
code = code.replace(/const handlePointerDown = \(\) => setIsPaused\(true\)\n\s*const handlePointerUp = \(\) => setIsPaused\(false\)\n\s*/, '');

// 2. Remove pointer handlers from Media Container
code = code.replace(/className="flex-1 relative w-full h-full overflow-hidden"\n\s*onPointerDown=\{handlePointerDown\}\n\s*onPointerUp=\{handlePointerUp\}\n\s*onPointerLeave=\{handlePointerUp\}/, 'className="flex-1 relative w-full h-full overflow-hidden"');

// 3. Replace the click zones with the new architecture
code = code.replace(
  /\{\/\* Invisible Click Zones for navigation \(only active if not showing viewers\) \*\/\}\n\s*\{!showViewers && \(\n\s*<>\n\s*<div className="absolute top-0 left-0 w-1\/3 h-full z-50 cursor-pointer" onClick=\{\(e\) => \{ e\.stopPropagation\(\); prevStory\(\); \}\} \/>\n\s*<div className="absolute top-0 right-0 w-2\/3 h-full z-50 cursor-pointer" onClick=\{\(e\) => \{ e\.stopPropagation\(\); nextStory\(\); \}\} \/>\n\s*<\/>\n\s*\)\}/,
  `{/* LEFT NAV ZONE */}
            <div 
              aria-label="Historia anterior"
              className="absolute left-0 top-[10%] bottom-[20%] w-[25%] z-[5] cursor-pointer"
              onClick={(e) => { e.stopPropagation(); prevStory(); }}
            />
            {/* RIGHT NAV ZONE */}
            <div 
              aria-label="Historia siguiente"
              className="absolute right-0 top-[10%] bottom-[20%] w-[25%] z-[5] cursor-pointer"
              onClick={(e) => { e.stopPropagation(); nextStory(); }}
            />`
);

// 4. Ensure X button closes and stops propagation robustly
code = code.replace(
  /<button onClick=\{\(\) => \{ stop\(\); close\(\); \}\} className="hover:scale-110 transition-transform">/,
  `<button onClick={(e) => { e.stopPropagation(); stop(); close(); }} className="hover:scale-110 transition-transform relative z-50 pointer-events-auto">`
);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
console.log('Fixed StoriesViewer navigation architecture');

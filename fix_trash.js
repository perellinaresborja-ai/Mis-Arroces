const fs = require('fs');
let s = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

s = s.replace(
  '{isDraggingOverlay && (',
  '{(isDraggingOverlay || selectedOverlayId) && ('
);

s = s.replace(
  '<div id="story-trash" className="absolute bottom-10 left-1/2 -translate-x-1/2 w-16 h-16 bg-red-500/80 rounded-full flex items-center justify-center text-white z-[100] transition-transform scale-90">',
  '<div id="story-trash" onClick={(e) => { e.stopPropagation(); if (selectedOverlayId) { setOverlays(overlays.filter(o => o.id !== selectedOverlayId)); setSelectedOverlayId(null); } }} className={`absolute bottom-10 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center text-white z-[100] transition-transform cursor-pointer shadow-xl ${isDraggingOverlay ? "bg-red-500/80 scale-90" : "bg-red-500 hover:scale-110"}`}>'
);

fs.writeFileSync('src/components/domain/StoryCreator.tsx', s, 'utf8');

const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

// 1. Remove the old transparent z-50 click zones
code = code.replace(
  /\{\/\* Invisible Click Zones for navigation \(only active if not showing viewers\) \*\/\}\s*\{!showViewers && \(\s*<>\s*<div className="absolute top-0 left-0 w-1\/3 h-full z-50 cursor-pointer" onClick=\{\(e\) => \{ e\.stopPropagation\(\); prevStory\(\); \}\} \/>\s*<div className="absolute top-0 right-0 w-2\/3 h-full z-50 cursor-pointer" onClick=\{\(e\) => \{ e\.stopPropagation\(\); nextStory\(\); \}\} \/>\s*<\/>\s*\)\}/,
  ''
);

// 2. Add the robust handlers to the main wrapper
// We look for:
// <div className="relative w-full h-full max-w-lg mx-auto bg-zinc-900 md:rounded-3xl md:h-[90vh] overflow-hidden shadow-2xl flex flex-col md:my-auto">

code = code.replace(
  /<div className="relative w-full h-full max-w-lg mx-auto bg-zinc-900 md:rounded-3xl md:h-\[90vh\] overflow-hidden shadow-2xl flex flex-col md:my-auto">/,
  `<div className="relative w-full h-full max-w-lg mx-auto bg-zinc-900 md:rounded-3xl md:h-[90vh] overflow-hidden shadow-2xl flex flex-col md:my-auto"
        onClick={(e) => {
          if (showViewers || ownerMenuOpen || insightsOpen) return;
          const target = e.target as Element;
          if (target.closest('[data-story-interactive="true"]') || target.closest('button') || target.closest('a') || target.closest('input') || target.closest('textarea')) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x < rect.width / 3) prevStory();
          else nextStory();
        }}
        onPointerDown={(e) => {
          const target = e.target as Element;
          if (target.closest('[data-story-interactive="true"]') || target.closest('button') || target.closest('a') || target.closest('input') || target.closest('textarea')) return;
          setIsPaused(true);
        }}
        onPointerUp={(e) => setIsPaused(false)}
        onPointerLeave={(e) => setIsPaused(false)}
      >`
);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
console.log('Fixed StoriesViewer navigation logic');

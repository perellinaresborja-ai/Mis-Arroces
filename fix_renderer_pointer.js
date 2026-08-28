const fs = require('fs');
let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

// Fix pointerEvents: mode === 'EDITOR' ? 'auto' : 'none',
// Interactive overlays MUST have pointer-events auto.
const replacement = `
            pointerEvents: (mode === 'EDITOR' || ['POLL', 'QUESTION', 'SLIDER', 'MENTION', 'LOCATION', 'RECIPE', 'INGREDIENT', 'SESSION', 'PROFILE'].includes(overlay.type)) ? 'auto' : 'none',
`;

code = code.replace(/pointerEvents:\s*mode\s*===\s*'EDITOR'\s*\?\s*'auto'\s*:\s*'none',/, replacement);

// Make sure clicks on interactive overlays stop propagation in Viewer
code = code.replace(
  /onClick=\{\(e\)\s*=>\s*\{/,
  `onClick={(e) => {
                if (['POLL', 'QUESTION', 'SLIDER', 'MENTION', 'LOCATION', 'RECIPE', 'INGREDIENT', 'SESSION', 'PROFILE'].includes(overlay.type)) {
                  e.stopPropagation();
                }`
);

fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);

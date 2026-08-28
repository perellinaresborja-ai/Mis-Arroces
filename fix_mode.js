const fs = require('fs');
let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

code = code.replace(
  /function renderOverlayContent\(overlay: StoryOverlay\) \{/,
  `function renderOverlayContent(overlay: StoryOverlay, mode?: string) {`
);

code = code.replace(
  /\{renderOverlayContent\(overlay\)\}/g,
  `{renderOverlayContent(overlay, mode)}`
);

fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log("FIXED MODE PROP");

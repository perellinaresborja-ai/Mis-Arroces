const fs = require('fs');

let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

// Add React import if missing
if (!code.includes("import React")) {
  code = `import React from 'react';\n` + code;
}

// Add storyId to props
code = code.replace(/interface SharedStoryRendererProps \{/, `interface SharedStoryRendererProps {\n  storyId?: string;`);
code = code.replace(/export function SharedStoryRenderer\(\{/, `export function SharedStoryRenderer({\n  storyId,`);

// Fix the poll results logic
code = code.replace(/if \(mode === 'VIEWER' && story\) \{/g, `if (mode === 'VIEWER' && storyId) {`);
code = code.replace(/for \(const ov of story\.overlays \|\| \[\]\) \{/g, `for (const ov of overlays || []) {`);
code = code.replace(/if \(mode === 'VIEWER' && story\) \{/g, `if (mode === 'VIEWER' && storyId) {`); // For the vote logic too
code = code.replace(/await votePoll\(story\.id, pollId, opt\);/g, `await votePoll(storyId, pollId, opt);`);

fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log('Fixed SharedStoryRenderer');

// Now update StoriesViewer to pass storyId
let viewer = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');
viewer = viewer.replace(/<SharedStoryRenderer\s+/g, `<SharedStoryRenderer storyId={story.id} `);
fs.writeFileSync('src/components/domain/StoriesViewer.tsx', viewer);
console.log('Fixed StoriesViewer');

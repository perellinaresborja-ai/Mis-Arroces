const fs = require('fs');
let f = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

f = f.replace(/setGroupIndex\(g => g \+ 1\)/g, 'setGroupIndex((g: number) => g + 1)');
f = f.replace(/setGroupIndex\(g => g \- 1\)/g, 'setGroupIndex((g: number) => g - 1)');
f = f.replace(/setStoryIndex\(s => s \+ 1\)/g, 'setStoryIndex((s: number) => s + 1)');
f = f.replace(/setStoryIndex\(s => s \- 1\)/g, 'setStoryIndex((s: number) => s - 1)');

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', f, 'utf8');

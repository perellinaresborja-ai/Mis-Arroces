const fs = require('fs');
const code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');
const lines = code.split('\n');
let inMedia = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('SharedStoryRenderer')) {
    console.log(i, lines[i]);
  }
}

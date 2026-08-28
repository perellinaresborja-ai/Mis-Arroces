const fs = require('fs');
const code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');
const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* Main Media (Video or Image) */}')) {
    console.log(lines.slice(i, i+70).join('\n'));
    break;
  }
}

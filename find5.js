const fs = require('fs');
const code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');
const lines = code.split('\n');
let found = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Media Container')) {
    found = true;
    console.log(lines.slice(i, i+100).join('\n'));
    break;
  }
}

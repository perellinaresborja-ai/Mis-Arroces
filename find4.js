const fs = require('fs');
const code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');
const lines = code.split('\n');
let found = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('</div>') && lines[i].includes('Header')) {
    // skip
  }
  if (lines[i].includes('X className')) {
    found = true;
    console.log(lines.slice(i-5, i+60).join('\n'));
    break;
  }
}

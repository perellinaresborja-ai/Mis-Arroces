const fs = require('fs');
const code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');
const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('fullUrl')) {
    console.log(lines.slice(i, i+50).join('\n'));
    break;
  }
}

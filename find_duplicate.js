const code = require('fs').readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.indexOf('name="reply"') !== -1);
console.log(lines.slice(idx - 30, idx + 30).join('\n'));

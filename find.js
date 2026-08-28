const fs = require('fs');
const lines = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('\`')) {
    console.log(i + ': ' + l);
  }
});

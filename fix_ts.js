const fs = require('fs');

function fix(file) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/\\`/g, '`').replace(/\\\$/g, '$');
  fs.writeFileSync(file, c);
}

fix('src/components/domain/EditHighlightModal.tsx');
fix('src/components/domain/SharedStoryRenderer.tsx');

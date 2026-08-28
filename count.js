const fs = require('fs');
const txt = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');
const count = (txt.match(/`/g) || []).length;
console.log('SharedStoryRenderer Backtick count:', count);

const txt2 = fs.readFileSync('src/components/domain/EditHighlightModal.tsx', 'utf8');
const count2 = (txt2.match(/`/g) || []).length;
console.log('EditHighlightModal Backtick count:', count2);

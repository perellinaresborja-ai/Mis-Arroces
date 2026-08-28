const fs = require('fs');

let creator = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');
creator = creator.replace(
  /const \[background: JSON\.parse\(JSON\.stringify\(background\)\), setBackground\]/,
  'const [background, setBackground]'
);
fs.writeFileSync('src/components/domain/StoryCreator.tsx', creator);

let modal = fs.readFileSync('src/components/domain/CreateHighlightModal.tsx', 'utf8');
modal = modal.replace(/undefined/g, 'null'); // wait, reversing what I did might break other things, I'll just change the fallback specifically.
// It's easier if I just rewrite the file.

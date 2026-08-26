const fs = require('fs');

let file = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');
file = file.replace(/Crea tu cuenta para participar en la conversaciÃ³n\./g, 'Crea tu cuenta para participar en la conversación.');
fs.writeFileSync('src/components/domain/FeedCard.tsx', file, 'utf8');

let file2 = fs.readFileSync('src/components/domain/CommentSection.tsx', 'utf8');
file2 = file2.replace(/Crea tu cuenta para participar en la conversaciÃ³n\./g, 'Crea tu cuenta para participar en la conversación.');
fs.writeFileSync('src/components/domain/CommentSection.tsx', file2, 'utf8');

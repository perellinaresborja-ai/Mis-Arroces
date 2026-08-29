const fs = require('fs');
let code = fs.readFileSync('src/components/domain/CommentSection.tsx', 'utf8');

code = code.replace(/onClick=\{\(\) => \{\s*if \(\!currentUserId\) showAuthPrompt\("Crea tu cuenta para participar en la conversación\."\)\s*\}\}/, '');

fs.writeFileSync('src/components/domain/CommentSection.tsx', code);

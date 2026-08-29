const fs = require('fs');
let code = fs.readFileSync('src/components/domain/CommentSection.tsx', 'utf8');

const target1 = `onClick={() => {
                    if (!currentUserId) showAuthPrompt("Crea tu cuenta para participar en la conversación.")
                  }}`;

code = code.replace(target1, '');

fs.writeFileSync('src/components/domain/CommentSection.tsx', code);

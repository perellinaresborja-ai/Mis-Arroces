const fs = require('fs');
let code = fs.readFileSync('src/components/domain/messages/MessageInput.tsx', 'utf8');
code = code.replace(
  "alert('Error enviando: ' + (err instanceof Error ? err.message : String(err)))",
  "alert('Error enviando: ' + (err instanceof Error ? err.message : JSON.stringify(err)))"
);
fs.writeFileSync('src/components/domain/messages/MessageInput.tsx', code);

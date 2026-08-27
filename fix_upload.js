const fs = require('fs');
let code = fs.readFileSync('src/components/domain/messages/MessageInput.tsx', 'utf8');
code = code.replace(
  /await supabase\.storage\.from\('message_media'\)\.upload\(path, file\)/,
  "await supabase.storage.from('message_media').upload(path, await file.arrayBuffer(), { contentType: file.type })"
);
fs.writeFileSync('src/components/domain/messages/MessageInput.tsx', code);

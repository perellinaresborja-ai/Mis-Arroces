const fs = require('fs');
let file = fs.readFileSync('src/app/sessions/[id]/page.tsx', 'utf8');
file = file.replace(
  'avatarUrl={session.author?.avatar?.storage_path}',
  'avatarUrl={session.author?.avatar?.storage_path || null}'
);
fs.writeFileSync('src/app/sessions/[id]/page.tsx', file, 'utf8');

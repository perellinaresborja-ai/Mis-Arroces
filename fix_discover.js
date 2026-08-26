const fs = require('fs');

let file = fs.readFileSync('src/app/discover/page.tsx', 'utf8');

file = file.replace(
  'id, username, display_name, account_type, privacy_level, bio,',
  'id, username, display_name, account_type, professional_type, privacy_level, bio,'
);

file = file.replace(
  'id, username, display_name, account_type, privacy_level,',
  'id, username, display_name, account_type, professional_type, privacy_level,'
);

file = file.replace(
  /u\.account_type === 'CHEF'/g,
  "u.professional_type === 'CHEF'"
);

file = file.replace(
  /u\.account_type === 'RESTAURANT'/g,
  "u.professional_type === 'RESTAURANT'"
);

fs.writeFileSync('src/app/discover/page.tsx', file, 'utf8');

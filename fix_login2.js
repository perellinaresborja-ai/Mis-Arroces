const fs = require('fs');
let content = fs.readFileSync('src/app/login/actions.ts', 'utf8');

// I'll just find the exact block and replace it.
content = content.replace(/options: \{\s*emailRedirectTo:.*?\s*\}/, "options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.misarroces.es'}/auth/callback?next=/cookbook` }");

fs.writeFileSync('src/app/login/actions.ts', content, 'utf8');

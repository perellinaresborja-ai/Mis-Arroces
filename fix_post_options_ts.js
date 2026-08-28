const fs = require('fs');
let code = fs.readFileSync('src/app/actions/post_options.ts', 'utf8');

code = code.replace(/supabase\n\s*\.from\(table\)/g, 'supabase.from(table as any)');
code = code.replace(/from\('bookmarks'\)/g, "from('bookmarks' as any)");

fs.writeFileSync('src/app/actions/post_options.ts', code);
console.log("FIXED TS ERRORS IN POST OPTIONS");

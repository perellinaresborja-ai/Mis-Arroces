const fs = require('fs');
let content = fs.readFileSync('src/app/login/actions.ts', 'utf8');

const oldBlock = `  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: \\/auth/callback?next=/cookbook,
    }
  })`;

const regex = /const \{ data, error \} = await supabase\.auth\.signUp\(\{[\s\S]*?emailRedirectTo:.*?\}[\s\S]*?\}\)/;

const newBlock = `  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.misarroces.es";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: \`\${baseUrl}/auth/callback?next=/cookbook\`,
    }
  })`;

content = content.replace(regex, newBlock);
fs.writeFileSync('src/app/login/actions.ts', content, 'utf8');

const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Insert the redirect if not user
const redirectLogic = `
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    import("next/navigation").then(m => m.redirect("/login"))
  }
`;

// Replace the old auth fetching block
content = content.replace(
  /const supabase = await createClient\(\)\s*const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\)/,
  `const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const { redirect } = await import("next/navigation")
    redirect("/login")
  }`
);

fs.writeFileSync('src/app/page.tsx', content, 'utf8');

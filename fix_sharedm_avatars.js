const fs = require('fs');

let code = fs.readFileSync('src/components/domain/ShareDMModal.tsx', 'utf8');

// Update the query
code = code.replace(
  /select\("id, username, avatar_media_id"\)/,
  `select("id, username, avatar:media_assets!fk_profiles_avatar(storage_path)")`
);

// Update the rendering logic
code = code.replace(
  /\{u\.avatar_media_id \? \([\s\S]*?<img src=\{u\.avatar_media_id as string\}[\s\S]*?\/>\n\s*\) : \(/,
  `{(u.avatar as any)?.storage_path ? (
                    <img src={\`\${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe_media/\${(u.avatar as any).storage_path}\`} className="w-10 h-10 rounded-full border border-border object-cover" alt="" />
                  ) : (`
);

fs.writeFileSync('src/components/domain/ShareDMModal.tsx', code);
console.log("FIXED SHAREDMMODAL AVATARS");

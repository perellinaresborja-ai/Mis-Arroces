const fs = require('fs');

// --- Update page.tsx ---
let page = fs.readFileSync('src/app/discover/page.tsx', 'utf8');

// Replace `} else if (q) {` with `} else if (q || tab !== "todo") {`
page = page.replace(/\} else if \(q\) \{/, `} else if (q || tab !== "todo") {`);

// Replace recipes query
page = page.replace(
  /\.ilike\("name", \`%\$\{q\}%\`\)\.order\("created_at", \{ ascending: false \}\)\.limit\(20\)/,
  `.order("created_at", { ascending: false }).limit(20)
      if (q) req = req.ilike("name", \`%\${q}%\`)`
);

// Replace profiles query
page = page.replace(
  /const \{ data \} = await supabase\.from\("profiles"\)\.select\(\`\s+id, username, display_name, account_type, professional_type, privacy_level, bio,\s+avatar:media_assets!fk_profiles_avatar\(storage_path\)\s+\`\)\.or\(\`username\.ilike\.%\$\{searchQ\}%,display_name\.ilike\.%\$\{searchQ\}%\`\)\.limit\(20\)/,
  `let reqProfiles = supabase.from("profiles").select(\`
        id, username, display_name, account_type, professional_type, privacy_level, bio,
        avatar:media_assets!fk_profiles_avatar(storage_path)
      \`).limit(20)
      if (q) reqProfiles = reqProfiles.or(\`username.ilike.%\${searchQ}%,display_name.ilike.%\${searchQ}%\`)
      else reqProfiles = reqProfiles.eq("privacy_level", "PUBLIC")
      const { data } = await reqProfiles`
);

// Replace posts query
page = page.replace(
  /\.ilike\("content", \`%\$\{q\}%\`\)\.order\("created_at", \{ ascending: false \}\)\.limit\(20\)/,
  `.order("created_at", { ascending: false }).limit(20)
      if (q) req = req.ilike("content", \`%\${q}%\`)`
);
page = page.replace(
  /const \{ data \} = await supabase\.from\("social_posts"\)\.select/,
  `let req = supabase.from("social_posts").select`
);
page = page.replace(
  /searchResults\.posts = data \|\| \[\]/,
  `const { data } = await req
      searchResults.posts = data || []`
);

// Replace sessions query
page = page.replace(
  /\.ilike\("recipe\.name", \`%\$\{q\}%\`\)\.order\("date", \{ ascending: false \}\)\.limit\(20\)/,
  `.order("date", { ascending: false }).limit(20)
      if (q) req = req.ilike("recipe.name", \`%\${q}%\`)`
);
page = page.replace(
  /const \{ data \} = await supabase\.from\("cooking_sessions"\)\.select/,
  `let req = supabase.from("cooking_sessions").select`
);
page = page.replace(
  /if \(data\) searchResults\.sessions = data/,
  `const { data } = await req
      if (data) searchResults.sessions = data`
);

// Fix condition for showing search results section in page.tsx
page = page.replace(/\{q && \(/g, `{(q || tab !== "todo") && (`);

// Fix condition for Discover Home
page = page.replace(/if \(\!q\) \{/, `if (!q && tab === "todo") {`);
page = page.replace(/\{\!q && \(/g, `{(!q && tab === "todo") && (`);

fs.writeFileSync('src/app/discover/page.tsx', page);
console.log("UPDATED DISCOVER PAGE.TSX");


// --- Update DiscoverClient.tsx ---
let client = fs.readFileSync('src/app/discover/DiscoverClient.tsx', 'utf8');

client = client.replace(/\{initialQ && \(/, `{(initialQ || initialTab !== "todo") && (`);

fs.writeFileSync('src/app/discover/DiscoverClient.tsx', client);
console.log("UPDATED DISCOVERCLIENT.TSX");

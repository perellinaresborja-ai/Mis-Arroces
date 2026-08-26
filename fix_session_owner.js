const fs = require('fs');

// Fix sessions page
let sessionsPage = fs.readFileSync('src/app/sessions/[id]/page.tsx', 'utf8');
sessionsPage = sessionsPage.replace(/session\.owner_id/g, 'session.user_id');
fs.writeFileSync('src/app/sessions/[id]/page.tsx', sessionsPage, 'utf8');

// Fix instrument_interactions.js which probably used .owner_id for session
let interactions = fs.readFileSync('src/app/actions/interactions.ts', 'utf8');
interactions = interactions.replace(/from\("cooking_sessions"\)\.select\("owner_id"\)/g, 'from("cooking_sessions").select("user_id")');
interactions = interactions.replace(/ownerId = data\?\.owner_id;/g, 'ownerId = data?.owner_id || data?.user_id;');
fs.writeFileSync('src/app/actions/interactions.ts', interactions, 'utf8');

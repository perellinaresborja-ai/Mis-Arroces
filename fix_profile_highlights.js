const fs = require('fs');

let code = fs.readFileSync('src/app/[userParam]/page.tsx', 'utf8');

if (!code.includes('getProfileHighlights')) {
  code = code.replace(
    /import \{ createClient \} from "@\/lib\/supabase\/server"/,
    `import { createClient } from "@/lib/supabase/server"\nimport { getProfileHighlights } from "@/app/actions/highlights"`
  );
}

if (!code.includes('highlights = await getProfileHighlights')) {
  code = code.replace(
    /const isSelf = user\?\.id === profile\.id/,
    `const isSelf = user?.id === profile.id\n  \n  let highlights: any[] = []\n  if (isSelf || canViewPrivate) {\n    highlights = await getProfileHighlights(profile.id)\n  }`
  );
}

if (!code.includes('<ProfileHighlightsClient')) {
  code = code.replace(
    /<\/header>\s*<div className="px-1 md:px-0 mx-auto pb-6 w-full">/,
    `</header>\n        {(isSelf || (canViewPrivate && highlights.length > 0)) && (\n          <div className="w-full px-4 mb-4">\n            <ProfileHighlightsClient highlights={highlights} isMe={isSelf} currentUserId={user?.id} />\n          </div>\n        )}\n        <div className="px-1 md:px-0 mx-auto pb-6 w-full">`
  );
}

fs.writeFileSync('src/app/[userParam]/page.tsx', code);
console.log('Fixed profile highlights rendering');

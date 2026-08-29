const fs = require('fs');

let code = fs.readFileSync('src/app/[userParam]/page.tsx', 'utf8');

if (!code.includes('getArchivedStories')) {
  code = code.replace(
    /import \{ getProfileHighlights \} from "@\/app\/actions\/highlights"/,
    `import { getProfileHighlights } from "@/app/actions/highlights"
import { getArchivedStories } from "@/app/actions/stories"`
  );

  code = code.replace(
    /let highlights: any\[\] = \[\]/,
    `let highlights: any[] = []
  let archivedStories: any[] = []`
  );

  code = code.replace(
    /highlights = await getProfileHighlights\(profile\.id\)\n\s*\}/,
    `highlights = await getProfileHighlights(profile.id)
  }
  if (isSelf) {
    archivedStories = await getArchivedStories()
  }`
  );

  code = code.replace(
    /<ProfileHighlightsClient highlights=\{highlights\} isMe=\{isSelf\} currentUserId=\{user\?\.id\} \/>/,
    `<ProfileHighlightsClient highlights={highlights} archivedStories={archivedStories} isMe={isSelf} />`
  );

  fs.writeFileSync('src/app/[userParam]/page.tsx', code);
}
console.log('Fixed page.tsx');

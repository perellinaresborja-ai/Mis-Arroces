const fs = require('fs');

let code = fs.readFileSync('src/components/domain/ProfileHighlightsClient.tsx', 'utf8');

const interfaces = `
interface HighlightData {
  id: string;
  name: string;
  cover_url?: string;
  user_id?: string;
  stories?: unknown[];
}
interface ArchivedStoryData {
  id: string;
  story_media?: { storage_path: string }[];
}
`;

if (!code.includes('interface HighlightData')) {
  code = code.replace(
    /import \{ EditHighlightModal \} from "\.\/EditHighlightModal"/,
    'import { EditHighlightModal } from "./EditHighlightModal"\n' + interfaces
  );
}

code = code.replace(
  /\{ highlights, archivedStories, isMe, currentUserId \}: \{ highlights: any\[\], archivedStories\?: any\[\], isMe: boolean, currentUserId\?: string \}/g,
  '{ highlights, archivedStories, isMe, currentUserId }: { highlights: HighlightData[], archivedStories?: ArchivedStoryData[], isMe: boolean, currentUserId?: string }'
);
// Also in case it didn't have currentUserId
code = code.replace(
  /\{ highlights, archivedStories, isMe \}: \{ highlights: any\[\], archivedStories\?: any\[\], isMe: boolean \}/g,
  '{ highlights, archivedStories, isMe, currentUserId }: { highlights: HighlightData[], archivedStories?: ArchivedStoryData[], isMe: boolean, currentUserId?: string }'
);

code = code.replace(/useState<any \| null>/g, 'useState<HighlightData | null>');

code = code.replace(/\(h: any\)/g, '(h: HighlightData)');

fs.writeFileSync('src/components/domain/ProfileHighlightsClient.tsx', code);
console.log('ProfileHighlightsClient fixed.');

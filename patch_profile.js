const fs = require('fs');

let profile = fs.readFileSync('src/app/[userParam]/page.tsx', 'utf8');

// Inject import
if (!profile.includes('ProfileHighlightsClient')) {
  profile = profile.replace(
    /import \{ ProfileGridCard \} from "\@\/components\/domain\/ProfileGridCard"/,
    `import { ProfileGridCard } from "@/components/domain/ProfileGridCard"\nimport { ProfileHighlightsClient } from "@/components/domain/ProfileHighlightsClient"`
  );
}

// Fetch archived stories for highlights creation if isMe
if (!profile.includes('archivedStories')) {
  profile = profile.replace(
    /const \{ data: highlights \}/,
    `
  let archivedStories: any[] = []
  if (isMe) {
    const { data: asc } = await supabase.from('stories').select('*, story_media(*)').eq('owner_id', profile.id).lte('expires_at', new Date().toISOString())
    archivedStories = asc || []
  }
  
  // Actually we need to fetch the stories INSIDE the highlights
  const { data: highlightsRaw } = await supabase.from('story_highlights').select('*, highlight_stories(*, story:stories(*, story_media(*)))').eq('user_id', profile.id);
  const highlights = highlightsRaw?.map(h => ({
    ...h,
    stories: h.highlight_stories.map((hs:any) => hs.story).filter(Boolean)
  })) || [];
    `
  );
}

// Replace the old highlights dummy code with the new client component
profile = profile.replace(
  /\{highlights && highlights\.length > 0 && \([\s\S]*?\}\)/,
  `{<ProfileHighlightsClient highlights={highlights} archivedStories={archivedStories} isMe={isMe} />}`
);

fs.writeFileSync('src/app/[userParam]/page.tsx', profile);

const fs = require('fs');

// 1. Update actions to include new endpoints
let actions = fs.readFileSync('src/app/actions/stories.ts', 'utf8');
if (!actions.includes('createStoryHighlight')) {
  actions += `
export async function createStoryHighlight(name: string, storyIds: string[], coverUrl?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: highlight, error } = await supabase.from('story_highlights').insert({
    user_id: user.id,
    name,
    cover_url: coverUrl
  }).select().single();
  
  if (error) throw error;
  
  if (storyIds.length > 0) {
    const inserts = storyIds.map((id, index) => ({
      highlight_id: highlight.id,
      story_id: id,
      display_order: index
    }));
    await supabase.from('highlight_stories').insert(inserts);
  }
  return highlight;
}

export async function voteStoryPoll(pollId: string, option: 'A' | 'B') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('story_poll_votes').insert({
    poll_id: pollId,
    user_id: user.id,
    selected_option: option
  });
}
`;
  fs.writeFileSync('src/app/actions/stories.ts', actions);
}

// 2. Add properties to StoryCreator
let creator = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');
if (!creator.includes('isDrawingMode')) {
  creator = creator.replace(
    /const \[overlays, setOverlays\] = useState<StoryOverlay\[\]>\(\[\]\)/,
    `const [overlays, setOverlays] = useState<StoryOverlay[]>([])
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [allowReplies, setAllowReplies] = useState(true)
  const [allowReactions, setAllowReactions] = useState(true)`
  );
  
  creator = creator.replace(
    /payload: \{ text: textOverlayValue \}/,
    `payload: { text: textOverlayValue, color: '#FFFFFF', styleType: 'clean' }`
  );
  
  fs.writeFileSync('src/components/domain/StoryCreator.tsx', creator);
}

// 3. Add Profile Highlight UI
let profile = fs.readFileSync('src/app/[userParam]/page.tsx', 'utf8');
if (!profile.includes('story_highlights')) {
  profile = profile.replace(
    /const \{ data: posts \} = await supabase/,
    `const { data: highlights } = await supabase.from('story_highlights').select('*, highlight_stories(story_id)').eq('user_id', profile.id);
  const { data: posts } = await supabase`
  );
  
  // Inject Highlights UI before the grid
  profile = profile.replace(
    /<div className="w-full">/,
    `{highlights && highlights.length > 0 && (
        <div className="w-full px-4 mb-6">
          <h3 className="font-bold mb-3 text-sm">Destacadas</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {highlights.map((h: any) => (
              <div key={h.id} className="flex flex-col items-center gap-1 cursor-pointer">
                <div className="w-16 h-16 rounded-full border-2 border-primary/20 bg-muted overflow-hidden flex items-center justify-center p-0.5">
                   <div className="w-full h-full rounded-full bg-card overflow-hidden">
                     {h.cover_url ? <img src={h.cover_url} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-muted-foreground/20" />}
                   </div>
                </div>
                <span className="text-xs font-medium truncate w-16 text-center">{h.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="w-full">`
  );
  fs.writeFileSync('src/app/[userParam]/page.tsx', profile);
}

console.log("APPLIED V3 PATCHES");

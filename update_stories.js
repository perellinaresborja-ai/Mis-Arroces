const fs = require('fs');
const path = 'src/components/domain/StoriesBar.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `        {groupedStories.map((group, i) => {
          const isMe = currentUser?.id === group.author.id;
          const showCreate = isMe && group.allSeen;
          
          const firstStory = group.stories[0];
          const coverMedia = firstStory?.story_media?.[0]?.media?.storage_path || 
                             firstStory?.recipe?.recipe_media?.[0]?.media?.storage_path || 
                             firstStory?.session?.session_media?.[0]?.media?.storage_path;
          
          return (
            <div 
              key={group.author.id} 
              onClick={() => handleOpenStories(i)}
              className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer hover:opacity-80 shrink-0 relative"
            >
              <div className={\`w-16 h-16 rounded-full p-0.5 border-2 \${group.allSeen ? 'border-border' : 'border-primary'}\`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {coverMedia ? (
                    <img src={\`https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/\${coverMedia}\`} className="w-full h-full object-cover" />
                  ) : group.author?.avatar?.storage_path ? (
                    <img src={\`https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/\${group.author.avatar.storage_path}\`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-muted-foreground">{(group.author?.display_name || group.author?.username || "?").charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>`;

content = content.replace(/\{groupedStories\.map\(\(group, i\) => \{[\s\S]*?<\/div>\s*<\/div>/m, replacement);
fs.writeFileSync(path, content, 'utf8');

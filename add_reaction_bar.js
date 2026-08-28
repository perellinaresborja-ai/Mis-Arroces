const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

const interactionBar = `
        {/* Interaction Bar (Viewers only) */}
        {!isMe && (
          <div className="absolute bottom-4 left-0 w-full px-4 z-40 pointer-events-auto">
            <div className="flex items-center gap-2">
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const val = (e.currentTarget.elements.namedItem('reply') as HTMLInputElement).value;
                  if (!val.trim()) return;
                  try {
                    const { submitQuestionReply } = await import('@/app/actions/stories');
                    await submitQuestionReply(currentStory.id, currentGroup.author.id, "Historia", val);
                    (e.currentTarget.elements.namedItem('reply') as HTMLInputElement).value = '';
                    alert('Respuesta enviada a DM');
                    setIsPaused(false);
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="flex-1"
              >
                <input 
                  name="reply"
                  type="text" 
                  placeholder="Responder..."
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  className="w-full bg-black/40 hover:bg-black/60 focus:bg-black/80 backdrop-blur-md rounded-full px-4 py-2 text-sm outline-none border border-white/20 text-white transition-all focus:border-white/50"
                  onClick={(e) => e.stopPropagation()}
                />
              </form>
              <div className="flex gap-1 bg-black/40 backdrop-blur-md rounded-full px-2 py-1 border border-white/10" onClick={(e) => e.stopPropagation()}>
                {['❤️', '😂', '😮', '😢', '🔥'].map(emoji => (
                  <button 
                    key={emoji}
                    onClick={async () => {
                      try {
                        const { votePoll } = await import('@/app/actions/stories');
                        // Using votePoll as a generic upsert into story_reactions since we built it that way
                        await votePoll(currentStory.id, "REACTION", emoji as any);
                        alert('Reacción ' + emoji + ' enviada');
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
`;

// Insert it right before the `Owner Viewers Footer`
code = code.replace(/\{\/\* Owner Viewers Footer \*\/\}/g, interactionBar + '\n        {/* Owner Viewers Footer */}');

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);

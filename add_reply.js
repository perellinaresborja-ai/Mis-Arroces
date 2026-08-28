const fs = require('fs');

let viewer = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

// Add imports
viewer = viewer.replace(
  /import \{ SharedStoryRenderer \} from "\.\/SharedStoryRenderer"/,
  `import { SharedStoryRenderer } from "./SharedStoryRenderer"
import { getOrCreateConversation, sendMessage } from "@/app/actions/messaging"
import { toggleStoryReaction } from "@/app/actions/stories"
import { toast } from "sonner"`
);

// Add state for reply
viewer = viewer.replace(
  /const \[showShare, setShowShare\] = useState\(false\)/,
  `const [showShare, setShowShare] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isSendingReply, setIsSendingReply] = useState(false)
  
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSendingReply) return;
    setIsSendingReply(true);
    try {
      const convId = await getOrCreateConversation(currentStory.owner_id);
      await sendMessage({
        conversationId: convId,
        type: 'STORY',
        body: replyText,
        entityId: currentStory.id
      });
      toast.success("Mensaje enviado");
      setReplyText("");
    } catch (err) {
      toast.error("No se pudo enviar el mensaje");
    } finally {
      setIsSendingReply(false);
    }
  }
  
  const handleReaction = async (reaction: string) => {
    try {
      await toggleStoryReaction(currentStory.id, reaction);
      toast.success(\`Reaccionaste con \${reaction}\`);
    } catch(err) {
      toast.error("Error al reaccionar");
    }
  }`
);

// We need to add the bottom bar
const bottomBar = `
        {/* Reply Bar */}
        <div className="absolute bottom-0 left-0 w-full p-4 pb-safe bg-gradient-to-t from-black/80 to-transparent z-40 flex flex-col gap-3 pointer-events-auto">
          {/* Caption */}
          {currentStory.caption && (
            <p className="text-sm drop-shadow-md text-white">{currentStory.caption}</p>
          )}
          
          {!isMe && (
            <div className="flex items-center gap-3 w-full max-w-lg mx-auto">
              <form onSubmit={handleReplySubmit} className="flex-1">
                <input 
                  type="text" 
                  placeholder="Responder..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  className="w-full h-11 bg-black/40 border border-white/20 rounded-full px-4 text-white placeholder-white/50 backdrop-blur-md outline-none focus:border-white/50 transition-colors"
                />
              </form>
              <div className="flex gap-2 text-2xl shrink-0">
                {['❤️', '😂', '🔥'].map(emoji => (
                  <button key={emoji} onClick={(e) => { e.stopPropagation(); handleReaction(emoji); }} className="hover:scale-125 transition-transform drop-shadow-lg">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          {isMe && (
            <div className="flex justify-center w-full">
               <button onClick={() => setShowViewers(true)} className="text-sm font-bold bg-black/40 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md flex items-center gap-2 hover:bg-black/60 transition-colors">
                 <span>👀</span> {currentStory.viewCount} {currentStory.viewCount === 1 ? 'vista' : 'vistas'}
               </button>
            </div>
          )}
        </div>
`;

// Replace existing Caption block
if (viewer.includes('{/* Caption */}')) {
  const startIdx = viewer.indexOf('{/* Caption */}');
  const endIdx = viewer.indexOf('{/* Linked Content CTA */}');
  if (startIdx !== -1 && endIdx !== -1) {
    viewer = viewer.substring(0, startIdx) + bottomBar + '\n        ' + viewer.substring(endIdx);
  }
}

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', viewer);
console.log("ADDED REPLY BAR");

const fs = require('fs');
let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

// Add Question state
if (!code.includes('const [questionReplies')) {
  code = code.replace(
    'const [isVoting, setIsVoting] = React.useState<Record<string, boolean>>({});',
    `const [isVoting, setIsVoting] = React.useState<Record<string, boolean>>({});
  const [questionReplies, setQuestionReplies] = React.useState<Record<string, string>>({});
  const [isSendingQ, setIsSendingQ] = React.useState<Record<string, boolean>>({});
  const [sentQ, setSentQ] = React.useState<Record<string, boolean>>({});`
  );
}

const questionRendererRegex = /case 'QUESTION': \{[\s\S]*?return \([\s\S]*?\);\s*\}/s;

const newQuestionRenderer = `case 'QUESTION': {
      const p = overlay.payload;
      const qId = overlay.id;
      
      const handleSendReply = async () => {
        if (mode === 'VIEWER' && storyId) {
          const val = (questionReplies[qId] || '').trim();
          if (!val) return;
          setIsSendingQ(prev => ({...prev, [qId]: true}));
          try {
            const { submitQuestionReply } = await import('@/app/actions/stories');
            // We need the ownerId. We don't have it directly from storyId unless passed or fetched.
            // Oh wait, story is not passed. We can fetch it or we need ownerId passed!
            // Let's import createClient and fetch it, or rely on submitQuestionReply fetching it inside!
            // Wait, submitQuestionReply signature: (storyId, ownerId, question, answer). Let's pass a dummy for ownerId and let the backend find it, or modify the backend to find it.
            // Actually, submitQuestionReply can just fetch the owner_id from storyId!
            await submitQuestionReply(storyId, 'DUMMY_OWNER', p.question, val);
            setSentQ(prev => ({...prev, [qId]: true}));
          } catch (e: any) {
            alert(e.message || 'Error al enviar');
          } finally {
            setIsSendingQ(prev => ({...prev, [qId]: false}));
          }
        }
      }

      return (
        <div className="bg-card rounded-2xl overflow-hidden shadow-xl w-64 border border-border flex flex-col pointer-events-auto">
          <div className="p-4 font-bold text-center bg-primary text-primary-foreground leading-tight">
            {p.question}
          </div>
          <div className="bg-background p-2">
            {!sentQ[qId] ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={questionReplies[qId] || ''}
                  onChange={e => setQuestionReplies(prev => ({...prev, [qId]: e.target.value}))}
                  onFocus={() => { if(onPauseRequest) onPauseRequest(); }}
                  onBlur={() => { if(onResumeRequest) onResumeRequest(); }}
                  disabled={isSendingQ[qId]}
                  placeholder="Responder..." 
                  className="w-full text-sm p-2 bg-muted rounded-xl outline-none"
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSendReply();
                  }}
                />
                <button 
                  onClick={handleSendReply}
                  disabled={isSendingQ[qId]}
                  className="p-2 text-sm font-bold bg-primary text-white rounded-xl"
                >
                  Enviar
                </button>
              </div>
            ) : (
              <div className="text-sm font-bold text-center text-green-600 p-2">
                ¡Enviado!
              </div>
            )}
          </div>
        </div>
      );
    }`;

code = code.replace(questionRendererRegex, newQuestionRenderer);

fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log('Patched renderer for Question');

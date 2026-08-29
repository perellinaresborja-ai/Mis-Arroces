const fs = require('fs');
let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

// We need to inject useState and useEffect for poll results.
if (!code.includes('const [pollResults')) {
  code = code.replace(
    /export function SharedStoryRenderer\(.*?\) \{/s,
    `$&
  const [pollResults, setPollResults] = React.useState<Record<string, any>>({});
  const [isVoting, setIsVoting] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (mode === 'VIEWER' && story) {
      const fetchPolls = async () => {
        try {
          const { getPollResults } = await import('@/app/actions/stories');
          const results: Record<string, any> = {};
          for (const ov of story.overlays || []) {
            if (ov.type === 'POLL') {
              const pollId = ov.payload.pollId || ov.id;
              results[pollId] = await getPollResults(pollId);
            }
          }
          setPollResults(results);
        } catch (e) {
          console.error('Error fetching poll results', e);
        }
      };
      fetchPolls();
    }
  }, [story, mode]);
`
  );
}

// Modify the case 'POLL' renderer to show results
const pollRendererRegex = /case 'POLL': \{[\s\S]*?const handlePollVote.*?\}\s*return \([\s\S]*?\);\s*\}/s;

const newPollRenderer = `case 'POLL': {
      const p = overlay.payload;
      const pollId = p.pollId || overlay.id;
      const results = pollResults[pollId];
      const hasVoted = !!results?.myVote;
      
      const handlePollVote = async (opt: 'A'|'B') => {
        if (mode === 'VIEWER' && story) {
          if (hasVoted || isVoting[pollId]) return;
          setIsVoting(prev => ({...prev, [pollId]: true}));
          if (onPauseRequest) onPauseRequest();
          try {
            const { votePoll, getPollResults } = await import('@/app/actions/stories');
            await votePoll(story.id, pollId, opt);
            const newRes = await getPollResults(pollId);
            setPollResults(prev => ({...prev, [pollId]: newRes}));
          } catch (e: any) {
            alert(e.message || 'Error al votar');
          } finally {
            setIsVoting(prev => ({...prev, [pollId]: false}));
            if (onResumeRequest) onResumeRequest();
          }
        }
      }

      return (
        <div className="bg-card rounded-2xl overflow-hidden shadow-xl w-64 border border-border flex flex-col pointer-events-auto">
          <div className="p-4 text-center font-bold text-lg leading-tight bg-primary text-primary-foreground">
            {p.question}
          </div>
          <div className="flex flex-col bg-background p-1 gap-1 relative">
            {!hasVoted ? (
              <div className="flex">
                <button onClick={() => handlePollVote('A')} disabled={isVoting[pollId]} className="flex-1 p-3 text-center font-bold hover:bg-muted text-primary transition-colors cursor-pointer">{p.optionA}</button>
                <div className="w-px bg-border my-2"></div>
                <button onClick={() => handlePollVote('B')} disabled={isVoting[pollId]} className="flex-1 p-3 text-center font-bold hover:bg-muted text-primary transition-colors cursor-pointer">{p.optionB}</button>
              </div>
            ) : (
              <div className="flex flex-col w-full text-sm font-bold">
                <div className="relative p-2 flex justify-between items-center z-10 overflow-hidden rounded-lg mb-1">
                  <div className="absolute left-0 top-0 bottom-0 bg-primary/20 transition-all duration-500" style={{width: \`\${results.percentA}%\`, zIndex: -1}}></div>
                  <span className={results.myVote === 'A' ? 'text-primary' : ''}>{p.optionA} {results.myVote === 'A' && '✓'}</span>
                  <span>{results.percentA}%</span>
                </div>
                <div className="relative p-2 flex justify-between items-center z-10 overflow-hidden rounded-lg">
                  <div className="absolute left-0 top-0 bottom-0 bg-primary/20 transition-all duration-500" style={{width: \`\${results.percentB}%\`, zIndex: -1}}></div>
                  <span className={results.myVote === 'B' ? 'text-primary' : ''}>{p.optionB} {results.myVote === 'B' && '✓'}</span>
                  <span>{results.percentB}%</span>
                </div>
                <div className="text-center text-[10px] text-muted-foreground mt-1">{results.total} votos</div>
              </div>
            )}
          </div>
        </div>
      );
    }`;

code = code.replace(pollRendererRegex, newPollRenderer);

fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log('Patched renderer');

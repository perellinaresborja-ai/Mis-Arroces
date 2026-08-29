const fs = require('fs');
let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

if (!code.includes('const [sliderResults')) {
  code = code.replace(
    'const [sentQ, setSentQ] = React.useState<Record<string, boolean>>({});',
    `const [sentQ, setSentQ] = React.useState<Record<string, boolean>>({});
  const [sliderResults, setSliderResults] = React.useState<Record<string, any>>({});
  const [sliderValues, setSliderValues] = React.useState<Record<string, number>>({});`
  );
}

if (!code.includes('getSliderResults')) {
  code = code.replace(
    /const pollId = ov\.payload\.pollId \|\| ov\.id;\n\s*results\[pollId\] = await getPollResults\(pollId\);\n\s*\}/g,
    `const pollId = ov.payload.pollId || ov.id;
              results[pollId] = await getPollResults(pollId);
            } else if (ov.type === 'SLIDER') {
              const { getSliderResults } = await import('@/app/actions/stories');
              const res = await getSliderResults(ov.id);
              setSliderResults(prev => ({...prev, [ov.id]: res}));
              if (res.myValue !== null) {
                setSliderValues(prev => ({...prev, [ov.id]: res.myValue}));
              }
            }`
  );
}

code = code.replace(
  /isSendingQ, setIsSendingQ, sentQ, setSentQ, onPauseRequest, onResumeRequest \}: any\)/g,
  `isSendingQ, setIsSendingQ, sentQ, setSentQ, onPauseRequest, onResumeRequest, sliderResults, setSliderResults, sliderValues, setSliderValues }: any)`
);

code = code.replace(
  /sentQ=\{sentQ\}\s*setSentQ=\{setSentQ\}\s*onPauseRequest=\{onPauseRequest\}\s*onResumeRequest=\{onResumeRequest\}/g,
  `sentQ={sentQ}
      setSentQ={setSentQ}
      onPauseRequest={onPauseRequest}
      onResumeRequest={onResumeRequest}
      sliderResults={sliderResults}
      setSliderResults={setSliderResults}
      sliderValues={sliderValues}
      setSliderValues={setSliderValues}`
);

const sliderRendererRegex = /case 'SLIDER': \{[\s\S]*?return \([\s\S]*?\);\s*\}/s;

const newSliderRenderer = `case 'SLIDER': {
      const p = overlay.payload;
      const sId = overlay.id;
      const res = sliderResults?.[sId] || { average: 0, count: 0 };
      const currentVal = sliderValues?.[sId] ?? 50;
      const handleChangeEnd = async (e: any) => {
        if (mode === 'VIEWER' && storyId) {
          const val = Number(e.target.value);
          try {
            const { upsertSliderValue, getSliderResults } = await import('@/app/actions/stories');
            await upsertSliderValue(storyId, sId, val);
            const newRes = await getSliderResults(sId);
            setSliderResults((prev: any) => ({...prev, [sId]: newRes}));
          } catch (err: any) {
            console.error(err);
            alert(err.message || 'Error al guardar');
          } finally {
            if (onResumeRequest) onResumeRequest();
          }
        }
      };
      return (
        <div className="bg-background/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-border/50 min-w-[200px] flex flex-col items-center gap-2 pointer-events-auto">
          <div className="font-bold text-foreground text-center leading-tight">{p.question}</div>
          <div className="w-full flex items-center gap-2 cursor-pointer mt-1">
            <div className="text-3xl filter drop-shadow-md">{p.emoji}</div>
            <input 
              type="range" 
              min="0" max="100" 
              value={currentVal} 
              onChange={e => {
                const val = Number(e.target.value);
                setSliderValues((prev: any) => ({...prev, [sId]: val}));
              }}
              onPointerDown={() => { if(onPauseRequest) onPauseRequest(); }}
              onPointerUp={handleChangeEnd}
              onTouchEnd={handleChangeEnd}
              className="flex-1 accent-primary cursor-grab h-2 bg-muted rounded-lg appearance-none" 
            />
          </div>
          {res.count > 0 && mode === 'VIEWER' && (
            <div className="w-full mt-2 text-xs text-muted-foreground flex justify-between px-2 font-semibold">
              <span>Promedio: {res.average}</span>
              <span>{res.count} votos</span>
            </div>
          )}
        </div>
      );
    }`;

code = code.replace(sliderRendererRegex, newSliderRenderer);
fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);

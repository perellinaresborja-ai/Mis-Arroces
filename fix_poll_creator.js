const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

// Add Poll Modal State
if (!code.includes('isPollModalOpen')) {
  code = code.replace(
    'const [isPublishing, setIsPublishing] = useState(false);',
    `const [isPublishing, setIsPublishing] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [pollForm, setPollForm] = useState({ question: '', optionA: 'Sí', optionB: 'No' });`
  );
}

// Add the UI logic to replace the hardcoded poll button
const hardcodedPoll = `onClick={() => { saveHistory(); setOverlays([...overlays, { id: 'poll_'+Date.now(), type: 'POLL', x:0.5, y:0.5, scale:1, rotation:0, zIndex: overlays.length+10, payload: { question: '¿Te gusta?', optionA: 'Sí', optionB: 'No' } }]); setMode('EDIT'); }}`;
const dynamicPoll = `onClick={() => { setMode('EDIT'); setIsPollModalOpen(true); }}`;
code = code.replace(hardcodedPoll, dynamicPoll);

// Add the Poll Modal render
const pollModalJSX = `
      {isPollModalOpen && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-sm p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-lg">Crear Encuesta</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pregunta</label>
              <input type="text" maxLength={60} value={pollForm.question} onChange={e => setPollForm({...pollForm, question: e.target.value})} className="w-full p-2 border rounded-xl" placeholder="Haz una pregunta..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Opción A</label>
              <input type="text" maxLength={20} value={pollForm.optionA} onChange={e => setPollForm({...pollForm, optionA: e.target.value})} className="w-full p-2 border rounded-xl" placeholder="Opción A" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Opción B</label>
              <input type="text" maxLength={20} value={pollForm.optionB} onChange={e => setPollForm({...pollForm, optionB: e.target.value})} className="w-full p-2 border rounded-xl" placeholder="Opción B" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setIsPollModalOpen(false)} className="flex-1 p-2 rounded-xl border font-bold">Cancelar</button>
              <button onClick={() => {
                if (!pollForm.question || !pollForm.optionA || !pollForm.optionB) return alert('Completa todos los campos');
                saveHistory();
                const pollId = require('uuid').v4(); // Or generate simple id
                setOverlays([...overlays, { id: pollId, type: 'POLL', x:0.5, y:0.5, scale:1, rotation:0, zIndex: overlays.length+10, payload: { pollId, question: pollForm.question, optionA: pollForm.optionA, optionB: pollForm.optionB } }]);
                setIsPollModalOpen(false);
              }} className="flex-1 p-2 rounded-xl bg-primary text-white font-bold">Añadir</button>
            </div>
          </div>
        </div>
      )}
`;
// Inject before the final div
if (!code.includes('Crear Encuesta')) {
  code = code.replace(/<DrawingOverlayRenderer/g, pollModalJSX + '\n      <DrawingOverlayRenderer');
}

// We need to inject publishing the poll to DB. In handlePublish:
const publishRegex = /await createStory\(newStory\);/g;
if (code.match(publishRegex)) {
  code = code.replace(publishRegex, `await createStory(newStory);
      
      // Publish polls
      const { publishPoll } = await import('@/app/actions/stories');
      for (const ov of overlays) {
        if (ov.type === 'POLL' && ov.payload.pollId) {
          await publishPoll(storyId, ov.payload.pollId, ov.payload.question, ov.payload.optionA, ov.payload.optionB).catch(console.error);
        }
      }`);
}

fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
console.log('Patched creator');

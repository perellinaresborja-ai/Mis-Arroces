const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

if (!code.includes('isQuestionModalOpen')) {
  code = code.replace(
    'const [isPollModalOpen, setIsPollModalOpen] = useState(false);',
    `const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionPrompt, setQuestionPrompt] = useState('');`
  );
}

// Replace the hardcoded question button
const hardcodedQ = `onClick={() => { saveHistory(); setOverlays([...overlays, { id: 'q_'+Date.now(), type: 'QUESTION', x:0.5, y:0.5, scale:1, rotation:0, zIndex: overlays.length+10, payload: { question: 'Hazme una pregunta' } }]); setMode('EDIT'); }}`;
const dynamicQ = `onClick={() => { setMode('EDIT'); setIsQuestionModalOpen(true); }}`;
code = code.replace(hardcodedQ, dynamicQ);

const qModal = `
      {isQuestionModalOpen && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-sm p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-lg">Caja de Preguntas</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Texto (Prompt)</label>
              <input type="text" maxLength={60} value={questionPrompt} onChange={e => setQuestionPrompt(e.target.value)} className="w-full p-2 border rounded-xl" placeholder="Escribe tu pregunta..." />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setIsQuestionModalOpen(false)} className="flex-1 p-2 rounded-xl border font-bold">Cancelar</button>
              <button onClick={() => {
                if (!questionPrompt.trim()) return alert('Escribe una pregunta');
                saveHistory();
                const qId = require('uuid').v4();
                setOverlays([...overlays, { id: qId, type: 'QUESTION', x:0.5, y:0.5, scale:1, rotation:0, zIndex: overlays.length+10, payload: { question: questionPrompt.trim() } }]);
                setIsQuestionModalOpen(false);
              }} className="flex-1 p-2 rounded-xl bg-primary text-white font-bold">Añadir</button>
            </div>
          </div>
        </div>
      )}
`;

if (!code.includes('Caja de Preguntas')) {
  code = code.replace(/<DrawingOverlayRenderer/g, qModal + '\n      <DrawingOverlayRenderer');
}

fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
console.log('Patched creator for Question');

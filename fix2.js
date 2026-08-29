const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');
if (!code.includes('isSliderModalOpen')) {
  code = code.replace(
    'const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);',
    `const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  const [sliderForm, setSliderForm] = useState({ prompt: '', emoji: '😋' });`
  );
}
const hardcodedSlider = `onClick={() => { saveHistory(); setOverlays([...overlays, { id: 's_'+Date.now(), type: 'SLIDER', x:0.5, y:0.5, scale:1, rotation:0, zIndex: overlays.length+10, payload: { question: '¿Qué tal?', emoji: '😍' } }]); setMode('EDIT'); }}`;
const dynamicSlider = `onClick={() => { setMode('EDIT'); setIsSliderModalOpen(true); }}`;
code = code.replace(hardcodedSlider, dynamicSlider);
const sModal = `
      {isSliderModalOpen && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-sm p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-lg">Emoji Slider</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pregunta</label>
              <input type="text" maxLength={60} value={sliderForm.prompt} onChange={e => setSliderForm({...sliderForm, prompt: e.target.value})} className="w-full p-2 border rounded-xl" placeholder="¿Qué opinas?" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Emoji</label>
              <div className="flex justify-between">
                {['😋', '🔥', '😍', '🤤', '👏', '❤️'].map(e => (
                  <button key={e} onClick={() => setSliderForm({...sliderForm, emoji: e})} className={\`text-2xl p-2 rounded-xl border \${sliderForm.emoji === e ? 'bg-primary/20 border-primary' : 'border-transparent'}\`}>{e}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setIsSliderModalOpen(false)} className="flex-1 p-2 rounded-xl border font-bold">Cancelar</button>
              <button onClick={() => {
                if (!sliderForm.prompt.trim()) return alert('Escribe una pregunta');
                saveHistory();
                const sId = require('uuid').v4();
                setOverlays([...overlays, { id: sId, type: 'SLIDER', x:0.5, y:0.5, scale:1, rotation:0, zIndex: overlays.length+10, payload: { question: sliderForm.prompt.trim(), emoji: sliderForm.emoji } }]);
                setIsSliderModalOpen(false);
              }} className="flex-1 p-2 rounded-xl bg-primary text-white font-bold">Añadir</button>
            </div>
          </div>
        </div>
      )}
`;
if (!code.includes('Emoji Slider')) {
  code = code.replace(/<DrawingOverlayRenderer/g, sModal + '\n      <DrawingOverlayRenderer');
}
fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);

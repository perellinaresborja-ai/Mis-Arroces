const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

// 1. Add states if not exist
if (!code.includes('const [showMenu, setShowMenu] = useState(false)')) {
  code = code.replace(
    'const [progress, setProgress] = useState(0) // 0 to 100 per story',
    `const [progress, setProgress] = useState(0) // 0 to 100 per story
  const [showMenu, setShowMenu] = useState(false)
  const [showShare, setShowShare] = useState(false)
  
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(true);
    setShowMenu(true);
  }
  
  const closeMenu = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowMenu(false);
    setIsPaused(false);
  }
  
  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + '/?story=' + currentStory.id);
    alert('Enlace copiado');
    closeMenu();
  }`
  );
}

// 2. Add MoreHorizontal to imports
if (!code.includes('MoreHorizontal')) {
  code = code.replace('import { X, Trash2 } from "lucide-react"', 'import { X, Trash2, MoreHorizontal, Copy, Share2, MessageCircle, Flag, BarChart2 as BarChartIcon } from "lucide-react"');
  code = code.replace('import { X } from "lucide-react"', 'import { X, Trash2, MoreHorizontal, Copy, Share2, MessageCircle, Flag, BarChart2 as BarChartIcon } from "lucide-react"');
}

// 3. Replace the header close button with the menu and close button
const headerSearch = `<button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 hover:bg-black/20 rounded-full transition-colors backdrop-blur-sm relative z-50 pointer-events-auto">
              <X className="w-6 h-6 drop-shadow-md" />
            </button>`;

const headerReplace = `<div className="flex gap-2 relative z-50 pointer-events-auto">
              <button onClick={handleMenuClick} className="p-2 hover:bg-black/20 rounded-full transition-colors backdrop-blur-sm">
                <MoreHorizontal className="w-6 h-6 drop-shadow-md text-white" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 hover:bg-black/20 rounded-full transition-colors backdrop-blur-sm">
                <X className="w-6 h-6 drop-shadow-md text-white" />
              </button>
            </div>`;

if (code.includes(headerSearch)) {
  code = code.replace(headerSearch, headerReplace);
}

// 4. Add the Menu Overlay and ShareDMModal rendering
const overlaySearch = `{/* Media Container */}`;
const overlayReplace = `{/* Context Menu Overlay */}
          {showMenu && (
            <div className="absolute inset-0 z-[60] bg-black/60 flex items-end justify-center pointer-events-auto" onClick={closeMenu}>
              <div className="w-full max-w-lg bg-zinc-900 rounded-t-3xl overflow-hidden flex flex-col pb-safe animate-in slide-in-from-bottom-full duration-200" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-3" />
                
                {currentUser?.id === currentStory.owner_id ? (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setShowViewers(true); closeMenu(); }} className="flex items-center gap-4 w-full p-4 hover:bg-white/5 transition-colors text-left border-b border-white/10">
                      <BarChartIcon className="w-6 h-6" /> <span className="font-semibold">Ver estadísticas</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setShowShare(true); closeMenu(); }} className="flex items-center gap-4 w-full p-4 hover:bg-white/5 transition-colors text-left border-b border-white/10">
                      <Share2 className="w-6 h-6" /> <span className="font-semibold">Compartir</span>
                    </button>
                    <button onClick={handleCopyLink} className="flex items-center gap-4 w-full p-4 hover:bg-white/5 transition-colors text-left border-b border-white/10">
                      <Copy className="w-6 h-6" /> <span className="font-semibold">Copiar enlace</span>
                    </button>
                    <button onClick={(e) => { handleDelete(e); closeMenu(); }} className="flex items-center gap-4 w-full p-4 hover:bg-red-500/20 text-red-500 transition-colors text-left border-b border-white/10">
                      <Trash2 className="w-6 h-6" /> <span className="font-semibold">Eliminar Story</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setShowShare(true); closeMenu(); }} className="flex items-center gap-4 w-full p-4 hover:bg-white/5 transition-colors text-left border-b border-white/10">
                      <Share2 className="w-6 h-6" /> <span className="font-semibold">Compartir</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setShowShare(true); closeMenu(); }} className="flex items-center gap-4 w-full p-4 hover:bg-white/5 transition-colors text-left border-b border-white/10">
                      <MessageCircle className="w-6 h-6" /> <span className="font-semibold">Enviar por mensaje</span>
                    </button>
                    <button onClick={handleCopyLink} className="flex items-center gap-4 w-full p-4 hover:bg-white/5 transition-colors text-left border-b border-white/10">
                      <Copy className="w-6 h-6" /> <span className="font-semibold">Copiar enlace</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); alert('Reportado'); closeMenu(); }} className="flex items-center gap-4 w-full p-4 hover:bg-red-500/20 text-red-500 transition-colors text-left border-b border-white/10">
                      <Flag className="w-6 h-6" /> <span className="font-semibold">Reportar</span>
                    </button>
                  </>
                )}
                <button onClick={closeMenu} className="w-full p-4 text-center text-white/70 hover:bg-white/5 font-semibold transition-colors mt-2">
                  Cancelar
                </button>
              </div>
            </div>
          )}
          
          {showShare && (
            <div className="absolute inset-0 z-[70] pointer-events-auto">
              <ShareDMModal isOpen={showShare} onClose={() => { setShowShare(false); setIsPaused(false); }} entityType="STORY" entityId={currentStory.id} />
            </div>
          )}

          {/* Media Container */}`;

if (code.includes(overlaySearch) && !code.includes('Context Menu Overlay')) {
  code = code.replace(overlaySearch, overlayReplace);
}

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/components/domain/CommentsModal.tsx', 'utf8');

if (!code.includes('MoreHorizontal')) {
  code = code.replace(/import \{ X \} from "lucide-react"/, 'import { X, MoreHorizontal, Bookmark, MessageSquareOff, Edit2, Trash2 } from "lucide-react"');
}

const headerRegex = /<div className="flex items-center justify-between p-4 border-b border-border shrink-0">\s*<h2 className="font-bold text-lg">Comentarios<\/h2>\s*<button onClick=\{onClose\} className="p-2 hover:bg-muted rounded-full transition-colors">\s*<X className="w-5 h-5" \/>\s*<\/button>\s*<\/div>/;

const newHeader = `<div className="flex items-center justify-between p-4 border-b border-border shrink-0 relative">
          <h2 className="font-bold text-lg">Comentarios</h2>
          <div className="flex items-center gap-2">
            {currentUserId && (
              <div className="relative">
                <button 
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)} 
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                {showOptionsMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowOptionsMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      <button onClick={() => { alert('Función de guardar en desarrollo'); setShowOptionsMenu(false); }} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted font-medium border-b border-border transition-colors">
                        <Bookmark className="w-4 h-4" /> Guardar
                      </button>
                      <button onClick={() => { alert('Función de desactivar comentarios en desarrollo'); setShowOptionsMenu(false); }} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted font-medium border-b border-border transition-colors">
                        <MessageSquareOff className="w-4 h-4" /> Desactivar comentarios
                      </button>
                      <button onClick={() => { alert('Función de editar en desarrollo'); setShowOptionsMenu(false); }} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted font-medium border-b border-border transition-colors">
                        <Edit2 className="w-4 h-4" /> Editar
                      </button>
                      <button onClick={() => { alert('Función de eliminar en desarrollo'); setShowOptionsMenu(false); }} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-destructive/10 text-destructive font-medium transition-colors">
                        <Trash2 className="w-4 h-4" /> Eliminar publicación
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>`;

code = code.replace(headerRegex, newHeader);

// add showOptionsMenu state
if (!code.includes('showOptionsMenu')) {
  code = code.replace(
    /const \[comments, setComments\] = useState<any\[\]>\(\[\]\)/,
    `const [comments, setComments] = useState<any[]>([])\n  const [showOptionsMenu, setShowOptionsMenu] = useState(false)`
  );
}

fs.writeFileSync('src/components/domain/CommentsModal.tsx', code);
console.log("ADDED OPTIONS MENU");

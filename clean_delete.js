const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

// 1. Imports
if (code.includes('import { X } from "lucide-react"')) {
  code = code.replace('import { X } from "lucide-react"', 'import { X, Trash2 } from "lucide-react"');
}

if (!code.includes('deleteStory')) {
  code = code.replace('markStoryViewed, fetchStoryViewers', 'markStoryViewed, fetchStoryViewers, deleteStory');
}

// 2. handleDelete
const targetFn = `  const nextStory = useCallback(() => {`;
const newFn = `  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(true);
    if (!confirm("¿Eliminar esta historia?")) {
      setIsPaused(false);
      return;
    }
    try {
      await deleteStory(currentStory.id);
      window.location.reload();
    } catch (e) {
      alert("Error al eliminar la historia");
      setIsPaused(false);
    }
  };

  const nextStory = useCallback(() => {`;

if (code.includes(targetFn)) {
  code = code.replace(targetFn, newFn);
}

// 3. Header button
const targetHeader = `<button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 hover:bg-black/20 rounded-full transition-colors backdrop-blur-sm relative z-50 pointer-events-auto">
            <X className="w-6 h-6 drop-shadow-md" />
          </button>`;

const newHeader = `<div className="flex gap-2 relative z-50 pointer-events-auto">
            {currentUser?.id === currentStory.owner_id && (
              <button onClick={handleDelete} className="p-2 hover:bg-red-500/80 rounded-full transition-colors backdrop-blur-sm">
                <Trash2 className="w-5 h-5 drop-shadow-md text-white" />
              </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 hover:bg-black/20 rounded-full transition-colors backdrop-blur-sm">
              <X className="w-6 h-6 drop-shadow-md" />
            </button>
          </div>`;

if (code.includes(targetHeader)) {
  code = code.replace(targetHeader, newHeader);
}

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);

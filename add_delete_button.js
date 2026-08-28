const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

// Add Trash2 to lucide imports
if (code.includes('import { X } from "lucide-react"')) {
  code = code.replace('import { X } from "lucide-react"', 'import { X, Trash2 } from "lucide-react"');
} else if (code.includes('import { X, ')) {
  code = code.replace('import { X, ', 'import { X, Trash2, ');
} else if (code.includes('import { ')) {
  code = code.replace('import { ', 'import { Trash2, ');
}

// Add deleteStory to stories actions import
if (code.includes('markStoryViewed, fetchStoryViewers')) {
  code = code.replace('markStoryViewed, fetchStoryViewers', 'markStoryViewed, fetchStoryViewers, deleteStory');
} else {
  code = `import { deleteStory } from "@/app/actions/stories"\n` + code;
}

// Add handleDelete function inside the component
const fnTarget = `const nextStory = useCallback(() => {`;
const handleDeleteFn = `
  const handleDelete = async (e: React.MouseEvent) => {
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

code = code.replace(fnTarget, handleDeleteFn);

// Add the Trash button to the Header
const headerTarget = `<button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 hover:bg-black/20 rounded-full transition-colors backdrop-blur-sm relative z-50 pointer-events-auto">`;

const headerReplacement = `
          <div className="flex gap-2 relative z-50 pointer-events-auto">
            {currentUser?.id === currentStory.owner_id && (
              <button onClick={handleDelete} className="p-2 hover:bg-red-500/80 rounded-full transition-colors backdrop-blur-sm">
                <Trash2 className="w-5 h-5 drop-shadow-md text-white" />
              </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 hover:bg-black/20 rounded-full transition-colors backdrop-blur-sm">
`;

code = code.replace(headerTarget, headerReplacement);
code = code.replace(`<X className="w-6 h-6 drop-shadow-md" />\n          </button>`, `<X className="w-6 h-6 drop-shadow-md" />\n            </button>\n          </div>`);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);

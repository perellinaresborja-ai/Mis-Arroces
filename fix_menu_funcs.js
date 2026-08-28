const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

// Replace setShowInsights with setShowViewers
code = code.replace(/setShowInsights/g, 'setShowViewers');

// Check if handleDelete is missing, and insert it if so
if (!code.includes('const handleDelete =')) {
  const targetFn = `const nextStory = useCallback(() => {`;
  const newFn = `const handleDelete = async (e: React.MouseEvent) => {
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
  code = code.replace(targetFn, newFn);
}

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);

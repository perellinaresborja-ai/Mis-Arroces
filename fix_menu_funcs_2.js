const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

const targetFn = `  // Navigate next/prev story
  const nextStory = () => {`;
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

  // Navigate next/prev story
  const nextStory = () => {`;

code = code.replace(targetFn, newFn);
fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);

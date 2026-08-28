const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

// Replace Flag / Reportar with Trash / Eliminar in the non-owner branch
const reportarSearch = `<button onClick={(e) => { e.stopPropagation(); alert('Reportado'); closeMenu(); }} className="flex items-center gap-4 w-full p-4 hover:bg-red-500/20 text-red-500 transition-colors text-left border-b border-white/10">
                        <Flag className="w-6 h-6" /> <span className="font-semibold">Reportar</span>
                      </button>`;

const reportarReplace = `<button onClick={(e) => { handleDelete(e); closeMenu(); }} className="flex items-center gap-4 w-full p-4 hover:bg-red-500/20 text-red-500 transition-colors text-left border-b border-white/10">
                        <Trash2 className="w-6 h-6" /> <span className="font-semibold">Eliminar Story</span>
                      </button>`;

if (code.includes(reportarSearch)) {
  code = code.replace(reportarSearch, reportarReplace);
  
  // also modify handleDelete to give a better error message if they aren't the owner
  code = code.replace(
    `alert('Error al eliminar la historia');`,
    `alert('Error: Solo puedes eliminar tus propias historias.');`
  );

  fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
  console.log('Replaced Reportar with Eliminar');
} else {
  console.log('Could not find Reportar button');
}

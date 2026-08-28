const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

const regex = /<button onClick=\{\(e\) => \{ e\.stopPropagation\(\); alert\('Reportado'\); closeMenu\(\); \}\}.*?<Flag className="w-6 h-6" \/> <span className="font-semibold">Reportar<\/span>\s*<\/button>/s;

const reportarReplace = `<button onClick={(e) => { handleDelete(e); closeMenu(); }} className="flex items-center gap-4 w-full p-4 hover:bg-red-500/20 text-red-500 transition-colors text-left border-b border-white/10">
                        <Trash2 className="w-6 h-6" /> <span className="font-semibold">Eliminar Story</span>
                      </button>`;

if (regex.test(code)) {
  code = code.replace(regex, reportarReplace);
  code = code.replace(
    `alert('Error al eliminar la historia');`,
    `alert('Error: Solo puedes eliminar tus propias historias.');`
  );
  fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
  console.log('Replaced via regex');
} else {
  console.log('NOT FOUND');
}

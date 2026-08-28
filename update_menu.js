const fs = require('fs');
let code = fs.readFileSync('src/components/domain/PostOptionsMenu.tsx', 'utf8');

// Add imports
code = code.replace(
  /import \{ toggleComments, deleteEntity, toggleBookmark \} from "@\/app\/actions\/post_options"/,
  `import { toggleComments, deleteEntity, toggleBookmark, togglePin } from "@/app/actions/post_options"\nimport { Pin, PinOff, PlusCircle } from "lucide-react"`
);

// Add props
code = code.replace(
  /allowComments: boolean\n  onDeleted\?: \(\) => void \n\}\)/,
  `allowComments: boolean\n  onDeleted?: () => void \n  isPinned?: boolean\n})`
);

// Add handlers
const pinHandler = `
  const handleFijar = async () => {
    setShowMenu(false);
    try {
      await togglePin(entityType, entityId, !!isPinned);
      alert(isPinned ? "Publicación desfijada" : "Publicación fijada en el perfil");
      router.refresh();
    } catch (e: any) {
      alert(e.message || "Error al fijar publicación");
    }
  }

  const handleCrearHistoria = () => {
    setShowMenu(false);
    if (entityType === 'recipe') {
      router.push(\`/create/story?recipe_id=\${entityId}\`);
    } else if (entityType === 'session') {
      router.push(\`/create/story?session_id=\${entityId}\`);
    } else {
      alert("Solo se pueden crear historias desde recetas o elaboraciones.");
    }
  }
`;

code = code.replace(/const handleEditar = \(\) => \{/, `${pinHandler}\n\n  const handleEditar = () => {`);

// Add buttons to menu
const buttons = `
            {(entityType === 'recipe' || entityType === 'session') && (
              <button onClick={handleCrearHistoria} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted font-medium border-b border-border transition-colors text-foreground">
                <PlusCircle className="w-4 h-4" /> Compartir en tu Historia
              </button>
            )}
            <button onClick={handleFijar} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted font-medium border-b border-border transition-colors text-foreground">
              {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />} {isPinned ? "Desfijar de la cuadrícula" : "Fijar en la cuadrícula"}
            </button>
`;

code = code.replace(/<div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">/, 
`<div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
${buttons}`);

fs.writeFileSync('src/components/domain/PostOptionsMenu.tsx', code);
console.log("UPDATED PostOptionsMenu");

const fs = require('fs');
let code = fs.readFileSync('src/components/domain/CommentsModal.tsx', 'utf8');

// import the actions
if (!code.includes('import { toggleComments')) {
  code = code.replace(
    /import \{ X, MoreHorizontal, Bookmark, MessageSquareOff, Edit2, Trash2 \} from "lucide-react"/,
    `import { X, MoreHorizontal, Bookmark, MessageSquareOff, Edit2, Trash2 } from "lucide-react"\nimport { toggleComments, deleteEntity, toggleBookmark } from "@/app/actions/post_options"\nimport { useRouter } from "next/navigation"`
  );
}

// Add router to component
if (!code.includes('const router = useRouter()')) {
  code = code.replace(
    /const \[showOptionsMenu, setShowOptionsMenu\] = useState\(false\)/,
    `const [showOptionsMenu, setShowOptionsMenu] = useState(false)\n  const router = useRouter()`
  );
}

// Replace the mock alerts with real functions
const handleGuardar = `async () => {
                          setShowOptionsMenu(false);
                          try {
                            await toggleBookmark(entityType, entityId);
                            alert("Guardado actualizado");
                          } catch (e: any) {
                            alert(e.message?.includes('bookmarks') ? "Falta crear la tabla bookmarks en Supabase para guardar posts" : "Error al guardar");
                          }
                        }`;

const handleDesactivar = `async () => {
                          setShowOptionsMenu(false);
                          try {
                            await toggleComments(entityType, entityId, allowComments);
                            alert(allowComments ? "Comentarios desactivados" : "Comentarios activados");
                            router.refresh();
                          } catch (e) {
                            alert("Error al cambiar estado de comentarios");
                          }
                        }`;

const handleEditar = `() => {
                          setShowOptionsMenu(false);
                          if (entityType === 'recipe') {
                            router.push(\`/recipes/\${entityId}/edit\`);
                          } else {
                            alert("La página de edición para este tipo está en construcción");
                          }
                        }`;

const handleEliminar = `async () => {
                          if (!confirm("¿Seguro que quieres eliminar esta publicación de forma permanente?")) return;
                          setShowOptionsMenu(false);
                          try {
                            await deleteEntity(entityType, entityId);
                            onClose();
                            router.refresh();
                          } catch (e) {
                            alert("Error al eliminar");
                          }
                        }`;


code = code.replace(/onClick=\{.*?alert\('FunciÃ³n de guardar.*?\}\}/g, `onClick={${handleGuardar}}`);
code = code.replace(/onClick=\{.*?alert\('FunciÃ³n de desactivar.*?\}\}/g, `onClick={${handleDesactivar}}`);
code = code.replace(/onClick=\{.*?alert\('FunciÃ³n de editar.*?\}\}/g, `onClick={${handleEditar}}`);
code = code.replace(/onClick=\{.*?alert\('FunciÃ³n de eliminar.*?\}\}/g, `onClick={${handleEliminar}}`);
code = code.replace(/Desactivar comentarios<\/button>/, `{allowComments ? 'Desactivar comentarios' : 'Activar comentarios'}</button>`);

fs.writeFileSync('src/components/domain/CommentsModal.tsx', code);
console.log("HOOKED UP OPTIONS MENU");

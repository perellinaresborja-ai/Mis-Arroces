const fs = require('fs');
let code = fs.readFileSync('src/components/domain/CommentSection.tsx', 'utf8');

// 1. Full width bubble
code = code.replace(
  'inline-block min-w-[200px] pr-8',
  'w-full'
);
// Make sure both are replaced
code = code.replace(
  'inline-block min-w-[200px] pr-8',
  'w-full'
);

// 2. Reorder buttons
// Let's just find the whole return block of CommentThread and replace the div containing the buttons.
const buttonsRegex1 = /<div className="flex items-center gap-4 mt-1 px-3 text-xs text-muted-foreground font-medium">[\s\S]*?<\/div>/;
const replacement1 = `<div className="flex items-center gap-4 mt-1 px-3 text-xs text-muted-foreground font-medium">
          {!comment.is_deleted && (
            <button onClick={handleLike} disabled={isPending} className="flex items-center gap-1 hover:text-foreground">
              <PaellaLike active={isLiked} className="w-4 h-4" />
              {likeCount > 0 && <span className={cn(isLiked && "text-primary")}>{likeCount}</span>}
            </button>
          )}

          {allowComments && !comment.is_deleted && (
            <button onClick={() => onReply(comment.id, comment.author.username)} className="hover:text-foreground">
              Responder
            </button>
          )}
          
          {isOwn && !comment.is_deleted && (
            <>
              <button onClick={() => setIsEditing(true)} className="hover:text-foreground" disabled={isPending}>
                Editar
              </button>
              <button onClick={() => onDelete(comment.id)} className="hover:text-destructive flex items-center gap-1" disabled={isPending}>
                Eliminar
              </button>
            </>
          )}
        </div>`;
code = code.replace(buttonsRegex1, replacement1);

const buttonsRegex2 = /<div className="flex items-center gap-4 mt-1 px-2 text-\[11px\] text-muted-foreground font-medium">[\s\S]*?<\/div>/;
const replacement2 = `<div className="flex items-center gap-4 mt-1 px-2 text-[11px] text-muted-foreground font-medium">
          {!comment.is_deleted && (
            <button onClick={handleLike} disabled={isPending} className="flex items-center gap-1 hover:text-foreground">
              <PaellaLike active={isLiked} className="w-4 h-4" />
              {likeCount > 0 && <span className={cn(isLiked && "text-primary")}>{likeCount}</span>}
            </button>
          )}

          {allowComments && !comment.is_deleted && (
            <button onClick={onReply} className="hover:text-foreground">
              Responder
            </button>
          )}
          
          {isOwn && !comment.is_deleted && (
            <button onClick={() => onDelete(comment.id)} className="hover:text-destructive flex items-center gap-1" disabled={isPending}>
              Eliminar
            </button>
          )}
        </div>`;
code = code.replace(buttonsRegex2, replacement2);

// 3. Move the input form to the bottom of CommentSection
// Let's find the exact block.
const formStartStr = '{allowComments ? (\n        <form onSubmit={handleSubmit} className="space-y-2 mb-6">';
const formStart = code.indexOf('{allowComments ? (');
// find the corresponding ')' for the ternary
// it ends with:
//         </div>
//       )}
// Let's find: `Los comentarios están desactivados`
const disabledStr = 'Los comentarios est';
const disabledIdx = code.indexOf(disabledStr);
const formEnd = code.indexOf(')}', disabledIdx) + 2;

const formCodeOriginal = code.substring(formStart, formEnd);

// Replace it with empty string
code = code.replace(formCodeOriginal, '');

// Append it right before the last closing </div> of CommentSection
const lastDiv = code.lastIndexOf('</div>');
code = code.substring(0, lastDiv) + 
`
      <div className="sticky bottom-0 bg-background/95 backdrop-blur pt-2 pb-safe-bottom z-10 w-full mt-4 border-t border-border/50">
        ${formCodeOriginal}
      </div>
` + code.substring(lastDiv);

fs.writeFileSync('src/components/domain/CommentSection.tsx', code);
console.log('All 3 tasks applied');

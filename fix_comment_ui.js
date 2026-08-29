const fs = require('fs');

let code = fs.readFileSync('src/components/domain/CommentSection.tsx', 'utf8');

// 1. Make the comment bubble take full width
code = code.replace(
  /<div className="bg-muted\/50 rounded-2xl p-3 inline-block min-w-\[200px\] pr-8">/,
  '<div className="bg-muted/50 rounded-2xl p-3 w-full">'
);
code = code.replace(
  /<div className="bg-muted\/50 rounded-2xl p-3 inline-block min-w-\[200px\] pr-8 mt-1">/,
  '<div className="bg-muted/50 rounded-2xl p-3 w-full mt-1">'
);

// 2. Reorder buttons: PaellaLike, Responder, Editar, Eliminar
const oldButtons = `{allowComments && !comment.is_deleted && (
            <button onClick={() => onReply(comment.id, comment.author.username)} className="hover:text-foreground">
              Responder
            </button>
          )}

          {!comment.is_deleted && (
            <button onClick={handleLike} disabled={isPending} className="flex items-center gap-1 hover:text-foreground">
              <PaellaLike active={isLiked} className="w-4 h-4" />
              {likeCount > 0 && <span className={cn(isLiked && "text-primary")}>{likeCount}</span>}
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
          )}`;

const newButtons = `{!comment.is_deleted && (
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
          )}`;

code = code.replace(oldButtons, newButtons);

// Same for the reply buttons
const oldReplyButtons = `{allowComments && !comment.is_deleted && (
            <button onClick={onReply} className="hover:text-foreground">
              Responder
            </button>
          )}

          {!comment.is_deleted && (
            <button onClick={handleLike} disabled={isPending} className="flex items-center gap-1 hover:text-foreground">
              <PaellaLike active={isLiked} className="w-4 h-4" />
              {likeCount > 0 && <span className={cn(isLiked && "text-primary")}>{likeCount}</span>}
            </button>
          )}
          
          {isOwn && !comment.is_deleted && (
            <button onClick={() => onDelete(comment.id)} className="hover:text-destructive flex items-center gap-1" disabled={isPending}>
              Eliminar
            </button>
          )}`;

const newReplyButtons = `{!comment.is_deleted && (
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
          )}`;

code = code.replace(oldReplyButtons, newReplyButtons);

fs.writeFileSync('src/components/domain/CommentSection.tsx', code);
console.log('Updated CommentSection');
